# Python

Treat parameters, loop targets, and module-level constants as immutable unless mutation is required.
Use `Final` for fixed module-level values and immutable collections for fixed values exposed across modules.
Add defensive copies only when callers can mutate a shared value.
Preserve evaluation order and exception timing when selecting generators or eager comprehensions.
Use f-strings for interpolation and `pathlib.Path` for filesystem paths.
Use standard parsers for structured data instead of string matching.
Handle specific exception types at the smallest scope that can recover.
Catch `Exception` only at documented boundaries, preserving intentional recovery and required failure reporting.
Keep public-function type hints without forcing full annotations on private glue code.
Use `match` for dispatch on one value when the declared Python version supports it.
Use Python suite syntax and convert deep recursion to iteration when depth scales with input.
Write public module, class, and function docstrings as multiline prose, including one-sentence docstrings.
Check implicit public names and declared exports such as `__all__`.
Describe public attributes and constants in their owning module or class docstring when direct docstrings are unavailable.
Put opening and closing triple quotes on separate lines.
Describe contracts and semantic constraints without repeating type hints.
