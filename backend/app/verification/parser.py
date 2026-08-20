import ast
import re
from typing import Dict, Any, Tuple
import z3

def normalize_constraint_string(constraint_str: str) -> str:
    """
    Normalizes constraint string syntax (e.g. uppercase OR/AND/TRUE/FALSE)
    so python ast.parse can process it.
    """
    # Replace whole word operators
    s = re.sub(r'\bOR\b', 'or', constraint_str)
    s = re.sub(r'\bAND\b', 'and', s)
    s = re.sub(r'\bNOT\b', 'not', s)
    s = re.sub(r'\btrue\b', 'True', s)
    s = re.sub(r'\bfalse\b', 'False', s)
    return s

class PolicyASTVisitor(ast.NodeVisitor):
    def __init__(self, runtime_vars: Dict[str, z3.ExprRef], symbol_table: Dict[str, z3.ExprRef]):
        self.runtime_vars = runtime_vars
        self.symbol_table = symbol_table

    def visit_Module(self, node: ast.Module) -> z3.ExprRef:
        if len(node.body) != 1 or not isinstance(node.body[0], ast.Expr):
            raise ValueError("Constraint must be a single expression")
        return self.visit(node.body[0].value)

    def visit_Expr(self, node: ast.Expr) -> z3.ExprRef:
        return self.visit(node.value)

    def visit_Name(self, node: ast.Name) -> z3.ExprRef:
        var_name = node.id
        if var_name in ("True", "False"):
            return z3.BoolVal(var_name == "True")

        if var_name in self.runtime_vars:
            return self.runtime_vars[var_name]

        # If not in runtime arguments, create symbol based on symbol_table or default to Real/Bool
        if var_name in self.symbol_table:
            return self.symbol_table[var_name]

        # Default fallback symbol creation
        sym = z3.Real(var_name)
        self.symbol_table[var_name] = sym
        return sym

    def visit_Constant(self, node: ast.Constant) -> Any:
        val = node.value
        if isinstance(val, bool):
            return z3.BoolVal(val)
        elif isinstance(val, (int, float)):
            return z3.RealVal(val)
        elif isinstance(val, str):
            return z3.StringVal(val)
        else:
            raise ValueError(f"Unsupported constant type: {type(val)}")

    def visit_UnaryOp(self, node: ast.UnaryOp) -> z3.ExprRef:
        operand = self.visit(node.operand)
        if isinstance(node.op, ast.Not):
            return z3.Not(operand)
        elif isinstance(node.op, ast.USub):
            return -operand
        else:
            raise ValueError(f"Unsupported unary operator: {type(node.op)}")

    def visit_BinOp(self, node: ast.BinOp) -> z3.ExprRef:
        left = self.visit(node.left)
        right = self.visit(node.right)
        if isinstance(node.op, ast.Add):
            return left + right
        elif isinstance(node.op, ast.Sub):
            return left - right
        elif isinstance(node.op, ast.Mult):
            return left * right
        elif isinstance(node.op, ast.Div):
            return left / right
        else:
            raise ValueError(f"Unsupported binary operator: {type(node.op)}")

    def visit_BoolOp(self, node: ast.BoolOp) -> z3.ExprRef:
        values = [self.visit(val) for val in node.values]
        if isinstance(node.op, ast.And):
            return z3.And(*values)
        elif isinstance(node.op, ast.Or):
            return z3.Or(*values)
        else:
            raise ValueError(f"Unsupported boolean operator: {type(node.op)}")

    def visit_Compare(self, node: ast.Compare) -> z3.ExprRef:
        left = self.visit(node.left)
        comparisons = []
        curr_left = left
        for op, comparator in zip(node.ops, node.comparators):
            curr_right = self.visit(comparator)
            if isinstance(op, ast.Eq):
                comparisons.append(curr_left == curr_right)
            elif isinstance(op, ast.NotEq):
                comparisons.append(curr_left != curr_right)
            elif isinstance(op, ast.Lt):
                comparisons.append(curr_left < curr_right)
            elif isinstance(op, ast.LtE):
                comparisons.append(curr_left <= curr_right)
            elif isinstance(op, ast.Gt):
                comparisons.append(curr_left > curr_right)
            elif isinstance(op, ast.GtE):
                comparisons.append(curr_left >= curr_right)
            else:
                raise ValueError(f"Unsupported comparison operator: {type(op)}")
            curr_left = curr_right

        if len(comparisons) == 1:
            return comparisons[0]
        return z3.And(*comparisons)

    def generic_visit(self, node: ast.AST):
        raise ValueError(f"Unsupported AST node: {type(node).__name__}")


def parse_constraint_to_z3(
    constraint_str: str, arguments: Dict[str, Any]
) -> Tuple[z3.ExprRef, list]:
    """
    Safely parses constraint string into Z3 expression and variable assertions.
    """
    normalized_str = normalize_constraint_string(constraint_str)
    parsed_ast = ast.parse(normalized_str, mode='exec')

    runtime_vars: Dict[str, z3.ExprRef] = {}
    symbol_table: Dict[str, z3.ExprRef] = {}
    runtime_assertions = []

    # Process input arguments into Z3 variables and bindings
    for key, val in arguments.items():
        if isinstance(val, bool):
            var = z3.Bool(key)
            runtime_vars[key] = var
            runtime_assertions.append(var == z3.BoolVal(val))
        elif isinstance(val, (int, float)):
            var = z3.Real(key)
            runtime_vars[key] = var
            runtime_assertions.append(var == z3.RealVal(val))
        elif isinstance(val, str):
            var = z3.String(key)
            runtime_vars[key] = var
            runtime_assertions.append(var == z3.StringVal(val))
        else:
            # Fallback string representation
            var = z3.String(key)
            runtime_vars[key] = var
            runtime_assertions.append(var == z3.StringVal(str(val)))

    visitor = PolicyASTVisitor(runtime_vars=runtime_vars, symbol_table=symbol_table)
    constraint_z3_expr = visitor.visit(parsed_ast)

    return constraint_z3_expr, runtime_assertions
