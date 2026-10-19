// Collects input and asks the backend to compute. No arithmetic happens here.
const display = document.getElementById("display");

const state = {
    a: "",
    op: null,
    b: "",
    // true right after a result/error, so the next digit starts a new entry
    fresh: false,
};

function render(text, isError = false) {
    display.textContent = text;
    display.classList.toggle("error", isError);
}

function renderExpression() {
    const parts = [state.a, state.op, state.b].filter(Boolean);
    render(parts.length ? parts.join(" ") : "0");
}

function reset() {
    state.a = "";
    state.op = null;
    state.b = "";
    state.fresh = false;
}

function inputDigit(digit) {
    if (state.fresh) {
        reset();
    }
    const key = state.op ? "b" : "a";
    if (digit === "." && state[key].includes(".")) {
        return;
    }
    state[key] += digit;
    renderExpression();
}

// Send the entered text as a number when it parses, otherwise as-is so the
// API decides how to report it.
function toPayloadValue(text) {
    const n = Number(text);
    return text !== "" && Number.isFinite(n) ? n : text;
}

async function calculate() {
    try {
        const response = await fetch("/api/calculate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                a: toPayloadValue(state.a),
                b: toPayloadValue(state.b),
                op: state.op,
            }),
        });
        const data = await response.json();
        if (!response.ok) {
            return { error: data.error || "Request failed" };
        }
        return { result: data.result };
    } catch (err) {
        return { error: "Could not reach the server" };
    }
}

async function evaluate() {
    if (!state.op) {
        return null;
    }
    const { result, error } = await calculate();
    if (error !== undefined) {
        reset();
        state.fresh = true;
        render(error, true);
        return null;
    }
    state.a = String(result);
    state.op = null;
    state.b = "";
    state.fresh = true;
    render(state.a);
    return result;
}

async function inputOperator(op) {
    if (state.a === "") {
        return;
    }
    // Chained operation like "2 + 3 *": evaluate the pending one first
    if (state.op && state.b !== "") {
        if ((await evaluate()) === null) {
            return;
        }
    }
    state.op = op;
    state.fresh = false;
    renderExpression();
}

document.querySelector(".keys").addEventListener("click", (event) => {
    const key = event.target.closest("button");
    if (!key) {
        return;
    }
    if (key.dataset.digit !== undefined) {
        inputDigit(key.dataset.digit);
    } else if (key.dataset.op !== undefined) {
        inputOperator(key.dataset.op);
    } else if (key.hasAttribute("data-equals")) {
        evaluate();
    }
});

document.addEventListener("keydown", (event) => {
    if (/^[0-9.]$/.test(event.key)) {
        inputDigit(event.key);
    } else if (["+", "-", "*", "/"].includes(event.key)) {
        event.preventDefault();
        inputOperator(event.key);
    } else if (event.key === "Enter" || event.key === "=") {
        event.preventDefault();
        evaluate();
    } else if (event.key === "Escape") {
        reset();
        renderExpression();
    }
});
