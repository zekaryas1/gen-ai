## Simple RAG from scratch

https://github.com/user-attachments/assets/4fecefbb-b9c0-4682-acaa-3c4a9ddf19f2

- The project uses [uv](https://docs.astral.sh/uv/) Python package and project manager.
- To run the project
    - `uv run main.py`
    - ask questions based on attached pdf file
        - ex: how to build a RAG system?, how does a RAG system work?
- Tools used
    - [LLM: A CLI utility and Python library for interacting with Large Language Models](https://llm.datasette.io/en/stable/#) from Simon Willison
	- [PyMuPDF 1.25.5 documentation](https://pymupdf.readthedocs.io/en/latest/index.html) a pdf processing library
    - LLM Model [orca-mini:3b](https://ollama.com/library/orca-mini:3b)
    - Embedding model [sentence-transformers/all-MiniLM-L6-v2 · Hugging Face](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)
