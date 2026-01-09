# Project Rules & Agent Guidelines

## 🧠 General Agent Behavior
- **Be Concise:** Do not explain basic code concepts. Focus on the logic and the "why" of complex decisions.
- **No Hallucinations:** If you do not see a library in `requirements.txt` or `package.json`, DO NOT import it. Ask permission to install it first.
- **Verify Before Committing:** Always run a syntax check or a basic build before marking a task as complete.
- **Code Comments:** Add comments only for complex logic. Do not add comments for obvious code (e.g., avoid `# Function to add two numbers`).

## 🐍 Python Guidelines (Backend)
- **Type Hinting:** All function arguments and return values must use Python type hints (`typing` module or standard types).
- **Modern Python:** Use Python 3.10+ syntax (e.g., match/case statements, union types `|` instead of `Union[]`).
- **Error Handling:** Use specific `try/except` blocks. Never use bare `except:`.
- **Data Validation:** Prefer `Pydantic` models over raw dictionaries for data transfer objects.
- **Formatting:** Adhere to PEP 8 standards.
- **Async:** If using frameworks like FastAPI, ensure database calls are `await`ed properly.

## ⚛️ React Guidelines (Frontend)
- **Functional Components:** strict usage of Functional Components with Hooks. No Class Components.
- **State Management:** Prefer local state (`useState`) or Context API for simple apps. Only suggest Redux/Zustand if the complexity warrants it.
- **Styling:** (Adjust this line based on your preference) Use Tailwind CSS utility classes. Avoid creating separate `.css` files unless necessary for global styles.
- **Naming:** Use PascalCase for components (e.g., `UserProfile.tsx`) and camelCase for functions/variables.
- **Performance:** Memoize expensive calculations with `useMemo` and callbacks with `useCallback` where appropriate.

## 🧪 Testing Requirements
- **Python:** Use `pytest`.
- **React:** Use `React Testing Library`.
- **Constraint:** Do not mark a "refactor" task as complete until existing tests pass.