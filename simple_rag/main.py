from typing import List, Tuple
from click import prompt
import pymupdf
from sentence_transformers import SentenceTransformer
import llm
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def parse_document(path: str) -> str:
    """
    Parse a PDF document and extract all text.
    
    Args:
        path: Path to the PDF file
        
    Returns:
        Concatenated text from all pages
    """
    doc = pymupdf.open(path)
    page_content = []
    
    for page in doc:
        text = page.get_text()
        page_content.append(text)
    
    return "".join(page_content)

def chunk_text(text: str, size: int, overlap: int) -> List[str]:
    """
    Split text into overlapping chunks.
    
    Args:
        text: Input text to chunk
        size: Size of each chunk
        overlap: Number of overlapping characters between chunks
        
    Returns:
        List of text chunks
    """
    chunks = []
    for i in range(0, len(text), size - overlap):
        chunk = text[i:i + size]
        chunks.append(chunk)
    
    return chunks

def get_embedding_collection() -> 'llm.Collection':
    """
    Initialize and return an embedding collection.
    
    Returns:
        Configured embedding collection
    """
    embedding_model = llm.get_embedding_model("sentence-transformers/all-MiniLM-L6-v2")
    return llm.Collection(name="entries", model=embedding_model)

def store_chunk_embeddings(chunks: List[str], collection: 'llm.Collection') -> None:
    """
    Store embeddings for text chunks in the collection.
    
    Args:
        chunks: List of text chunks
        collection: Embedding collection to store in
    """
    collection.embed_multi(
        entries=((i, chunk) for i, chunk in enumerate(chunks)),
        store=True
    )

def semantic_search(query: str, collection: 'llm.Collection') -> List[Tuple[float, str]]:
    """
    Perform semantic search on the collection.
    
    Args:
        query: Search query
        collection: Collection to search in
        
    Returns:
        List of tuples containing similarity score and content
    """
    similar_data = []
    for entry in collection.similar(query, 3):
        similar_data.append((entry.score, entry.content))
    return similar_data

def model_run(query: str, results: List[str]) -> str:
    """
    Generate response using the language model.
    
    Args:
        query: User query
        results: Relevant context from semantic search
        
    Returns:
        Model response text
    """
    model = llm.get_model("orca-mini-3b-gguf2-q4_0")
    context = "\n".join(results)
    
    response = model.prompt(
        f"User query: {query} and the following Context: {context}",
        key="sk-...",
        system="You are an AI assistant that provides answers based solely on the given context and user query. Please ensure your responses are clear, concise, and directly address the user query, including only relevant information.",
    )
    return response.text()

def main() -> None:
    file_path = "Introduction to Retrieval Augmented Generation (RAG) By Weaviate.pdf"
    
    # Document parsing
    logger.info("Started parsing document")
    page_content = parse_document(path=file_path)
    logger.info(f"Finished parsing, found {len(page_content)} characters")

    # Text chunking
    chunks = chunk_text(page_content, 200, 60)
    logger.info(f"Finished chunking, created {len(chunks)} chunks")

    # Embedding and storage
    collection = get_embedding_collection()
    store_chunk_embeddings(chunks, collection)
    logger.info("Processed and stored embeddings")

    # Get user query
    query = prompt("Please enter a question to ask")
    if not query:
        raise ValueError("Query cannot be empty")

    # Semantic search
    logger.info("Performing semantic search")
    similar_results = semantic_search(query, collection)

    # Process results
    if not similar_results or similar_results[0][0] < 0.6:
        logger.warning("Not enough context found")
        print("Not enough context found, please try another question")
    else:
        content_results = [content for _, content in similar_results]
        final_answer = model_run(query, content_results)
        print(final_answer)

if __name__ == "__main__":
    main()