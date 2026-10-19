import math

from flask import Flask, jsonify, render_template, request

from custom_classes import Calculator

app = Flask(__name__)

OPERATIONS = {
    "+": "add",
    "-": "subtract",
    "*": "multiply",
    "/": "divide",
}


def error(message):
    return jsonify({"error": message}), 400


def is_number(value):
    # bool is a subclass of int, so exclude it explicitly
    return (
        isinstance(value, (int, float))
        and not isinstance(value, bool)
        and math.isfinite(value)
    )


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/calculate", methods=["POST"])
def calculate():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return error("Request body must be a JSON object")

    missing = [field for field in ("a", "b", "op") if field not in data]
    if missing:
        return error(f"Missing field(s): {', '.join(missing)}")

    a, b, op = data["a"], data["b"], data["op"]
    if not is_number(a):
        return error("'a' must be a number")
    if not is_number(b):
        return error("'b' must be a number")
    if op not in OPERATIONS:
        return error(f"Unknown operator: {op}. Use one of + - * /")

    calculator = Calculator()
    try:
        result = getattr(calculator, OPERATIONS[op])(a, b)
    except ValueError as exc:
        return error(str(exc))

    if not math.isfinite(result):
        return error("Result is out of range")

    return jsonify({"result": result})


if __name__ == "__main__":
    app.run(debug=True)
