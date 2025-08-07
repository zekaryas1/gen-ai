import llm

if __name__ == "__main__":
    # Load the local language model
    model = llm.get_model("orca-mini-3b-gguf2-q4_0")

    # Context sentences to be used for answering the question
    context_sentences = [
        "Dogs have an exceptional sense of smell, up to 100,000 times stronger than humans.", 
        "They are highly social animals and thrive in companionship with people or other dogs.",
        "Some breeds, like Border Collies, are considered among the most intelligent animals on Earth."
    ]

    user_question = "What are dogs?"

    combined_context = " ".join(context_sentences)

    system_prompt = (
        "You are an AI assistant that provides answers strictly based on the provided context and user query. "
        "Your responses should be clear, concise, and directly address the question using only relevant information."
    )

    user_prompt = (
        "Based on the following context, provide a concise and coherent answer to the user's question.\n\n"
        f"Context:\n{combined_context}\n\n"
        f"User Question:\n{user_question}"
    )

    response = model.prompt(
        prompt=user_prompt,
        system=system_prompt
    )

    print(response.text())
