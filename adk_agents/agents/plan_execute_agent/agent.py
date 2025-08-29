from typing import TypedDict, Literal, Dict, List, Callable
from google.adk import Agent
from google.adk.tools import AgentTool, ToolContext

AGENT_MODEL = "gemini-2.0-flash"

class ToolResponse(TypedDict):
    status: Literal["success", "failed"]
    report: str


# In-memory contact storage
available_contacts: Dict[str, str] = {
    "mom": "mom@example.com",
    "dad": "dad@example.com",
    "bro(clay)": "brother@example.com",
    "sis(yid)": "sister@example.com",
    "abel": "abel@ceo.org",
}


def find_email_tool(name: str) -> ToolResponse:
    """
    Find the email address for a given contact name.

    Args:
        name: The name of the contact (e.g., 'mom', 'bro(clay)').

    Returns:
        A dictionary with 'status' ('success' or 'failed') and 'report' (email or error message).
    """
    clean_name = name.strip().lower() if name else ""
    if not clean_name:
        return {"status": "failed", "report": "Contact name is required."}
    elif clean_name not in available_contacts:
        return {"status": "failed", "report": f"No email found for contact '{name}'."}
    else:
        return {
            "status": "success",
            "report": available_contacts[clean_name]
        }


def delete_email_tool(email: str) -> ToolResponse:
    """
    Delete a contact's email from the contact list.

    Args:
        email: The email address to delete.

    Returns:
        A dictionary with 'status' ('success' or 'failed') and 'report' (confirmation or error message).
    """
    clean_email = email.strip().lower() if email else ""
    if not clean_email:
        return {"status": "failed", "report": "Email address is required."}

    name_to_delete = None
    for name, contact_email in available_contacts.items():
        if contact_email.lower() == clean_email:
            name_to_delete = name
            break

    if not name_to_delete:
        return {"status": "failed", "report": f"No contact found with email '{email}'."}

    del available_contacts[name_to_delete]
    return {"status": "success", "report": f"Email '{email}' has been deleted."}


async def write_message_agent_tool(topic: str, tool_context: ToolContext) -> ToolResponse:
    """
    Write a message for a given topic using the message_writer_agent.

    Args:
        topic: The topic or purpose of the message.
        tool_context: The context for running the agent tool.

    Returns:
        A dictionary with 'status' ('success' or 'failed') and 'report' (message or error).
    """
    if not topic or not topic.strip():
        return {"status": "failed", "report": "Topic is required to write a message."}

    agent_tool = AgentTool(agent=message_writer_agent)
    try:
        message = await agent_tool.run_async(
            args={"request": topic}, tool_context=tool_context
        )
        return {"status": "success", "report": message}
    except Exception as e:
        return {"status": "failed", "report": f"Failed to write message: {str(e)}"}


def send_email_tool(email: str, message: str) -> ToolResponse:
    """
    Send a message to the specified email address.

    Args:
        email: The recipient's email address.
        message: The message to send.

    Returns:
        A dictionary with 'status' ('success' or 'failed') and 'report' (confirmation or error message).
    """
    clean_email = email.strip().lower() if email else ""
    if not clean_email:
        return {"status": "failed", "report": "Email address is required."}
    if not message:
        return {"status": "failed", "report": "Message content is required."}

    return {
        "status": "success",
        "report": f"Message sent to '{email}': {message}"
    }


async def plan_executor_tool(
        actions: List[str],
        variables: dict[str, str],
        tool_context: ToolContext
) -> ToolResponse:
    """
    Execute a sequence of actions using provided variables.

    Args:
        actions: A list of actions to execute sequentially (e.g., ["find_email", "write_message", "send_email"]).
        variables: A dictionary of variables extracted from the user query (e.g., {"name": "mom", "topic": "greeting"}).
        tool_context: The context for running agent tools.

    Returns:
        A dictionary with 'status' ('success' or 'failed') and 'report' (result or error message).
    """
    action_map: Dict[str, Callable] = {
        "find_email": lambda: find_email_tool(variables.get("name", "")),
        "delete_email": lambda: delete_email_tool(variables.get("email", "")),
        "write_message": lambda: write_message_agent_tool(variables.get("topic", ""), tool_context),
        "send_email": lambda: send_email_tool(variables.get("email", ""), variables.get("message", ""))
    }

    for action in actions:
        if action not in action_map:
            return {"status": "failed", "report": f"Invalid action: '{action}'."}

        # Execute action
        response = await action_map[action]() if action == "write_message" else action_map[action]()

        if response["status"] != "success":
            return response

        # Update variables for next action
        if action == "find_email":
            variables["email"] = response["report"]
        elif action == "write_message":
            variables["message"] = response["report"]

        # Return response if this is the last action
        if action == actions[-1]:
            return response

    return {"status": "failed", "report": "No actions executed."}


message_writer_agent = Agent(
    name="message_writer_agent",
    model=AGENT_MODEL,
    instruction="""
    You are an AI Message Writer Agent that composes long, sincere email messages based on a given topic. 
    Your task is to write a well-structured, professional email message tailored to the topic provided.
    
    Guidelines
        - Tone: Use a sincere, polite, and professional tone unless otherwise specified.
        - Length: Write a message of 150–300 words, ensuring it is detailed and meaningful.
        - Content: Address the topic directly, providing relevant details, context, or sentiment.
        - Output: Return only the final message text, formatted as plain text suitable for email, with no additional commentary.
        - Error Handling: If the topic is unclear or insufficient, the calling tool will handle the error; focus on writing the message.
    Notes
    - Fill placeholder names (e.g., "[Recipient]") if the recipient's name is known.
""",
    description="An AI agent that composes long, sincere, and professional email messages based on a specified topic.",
)

root_agent = Agent(
    name="plan_execute_agent",
    model=AGENT_MODEL,
    instruction=f"""
        You are an AI Planning and Execution Agent that creates and executes action plans based on user queries. Your task is to extract variables from the query, plan a sequence of actions, and execute them using the plan_executor_tool.

        Available Actions
            find_email: Finds an email address by contact name.
              Available contacts: {list(available_contacts.keys())}.
              Pick a name inside available contacts that is close to what the user passed such as mother is close to mom, clay is bro or brother
            delete_email: Deletes a contact's email using the email address.
            write_message: Writes a message for a given topic (e.g., "birthday wish message", "congratulation on promotion").
            send_email: Sends a message to a specified email address.
        
        Tasks
            Extract Variables:
               Identify variables from the user query:
                 name: The contact name (e.g., "mom", "clay").
                 email: The email address (if provided directly).
                 topic: The message topic (e.g., "birthday wish message").
               If variables are missing, return a user-friendly error message (e.g., "Please provide a contact name or topic").
            Plan Actions:
               Determine the sequence of actions based on the query.
               Actions must be executed sequentially, as some depend on prior results (e.g., send_email requires a message from write_message).
               Example plans:
                 Send message to email: ["find_email", "write_message", "send_email"].
                 Delete email: ["find_email", "delete_email"].
                 Write message only: ["write_message"].
            Execute Plan:
               Call plan_executor_tool with the extracted variables and actions.
               Format the response based on the tool's output (status and report).
            Handle Errors:
               If no close match is found for a contact name, return: "No matching contact found for '[name]'."
               If an action fails, return the error message from plan_executor_tool.
        
        Guidelines
            Contact Matching**: Use close matches for names (e.g., "mother" → "mom", "brother" → "bro(clay)"). If no match, report the issue.
            Variable Validation**: Ensure required variables are present for each action (e.g., name for find_email, topic for write_message).
            Response Format**: Return a human-friendly message summarizing the result or error (e.g., "Email with message sent to mom@example.com" or "Failed to find contact 'john'").
            Action Order**: Respect dependencies (e.g., find_email before send_email, write_message before send_email).
        
        Examples
            Query: "Send a birthday email to mom"
              Variables: {{name: "mom", topic: "birthday wish message"}}
              Actions: ["find_email", "write_message", "send_email"]
              Response: "Birthday message sent to mom@example.com: [message summary]."
            Query: "Delete email for clay"
              Variables: {{name: "clay"}}
              Actions: ["find_email", "delete_email"]
              Response: "Email for 'clay' (brother@example.com) has been deleted."
            Query: "Write a congratulation message"
              Variables: {{topic: "congratulation on promotion"}}
              Actions: ["write_message"]
              Response: "Message written: [message content]."
            Query: "Send email to john"
              Response: "No matching contact found for 'john'."
        
        Input to plan_executor_tool
            variables: A dictionary {{name: str, topic: str, email: str, message: str}}.
            actions: A list of actions ["find_email", "write_message", "send_email", "delete_email"].
        
        Notes
            Use the report field from plan_executor_tool to craft the final response.
            If the query is ambiguous, ask for clarification (e.g., "Please specify a contact name or message topic").
""",
    description="An AI agent that plans and executes sequences of actions for email-related tasks, such as finding emails, writing messages, sending emails, or deleting contacts, based on user queries.",
    tools=[plan_executor_tool]
)
