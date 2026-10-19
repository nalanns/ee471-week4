# PROMPTS – Section 1: Calculator

AI tool used: Claude Code (VSCode)

## Prompt 1 – Build the app
```
In section1/, build a calculator web app with Flask.

- section1/custom_classes.py already has a Calculator class (add, subtract, multiply, divide). Use it for all calculations; you may extend it but don't rewrite it.
- Create section1/app.py: Flask serves the page at "/" and exposes POST /api/calculate.
  Request:  {"a": 12, "b": 3, "op": "/"}   (op is one of + - * /)
  Success:  200 {"result": 4.0}
  Error:    400 {"error": "<message>"} for missing fields, non-numeric a/b, unknown op, and division by zero.
  Do not use eval().
- Frontend: section1/templates/index.html, section1/static/style.css, section1/static/script.js.
  Match the design in design/calculator.png: navy body (#243060), light blue display and buttons (#DCE8F9), navy text, rounded corners, 4x4 grid: 7 8 9 / | 4 5 6 * | 1 2 3 - | 0 . = +.
  JS only collects input and calls the API; it must not compute results itself. Show the result or the API's error message in the display.
- Create section1/requirements.txt with flask.
```

## Correction 1 – Background color
**Problem:** The AI applied the navy color to the whole page background instead of only the calculator body as in the Figma design.

**Prompt:**
```
The whole page background is navy, but in design/calculator.png only the calculator body is navy.
Fix style.css: page background light gray (#F5F5F5), and wrap the display + buttons in a container with navy background (#243060), rounded corners and padding around the display and the grid, centered on the page. Don't change the JS or the backend.
```
