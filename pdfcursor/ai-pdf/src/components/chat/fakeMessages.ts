const conversationMessages = [
  {
    id: "vzmST8lA1viw9Q7E",
    createdAt: "2025-06-29T11:00:49.752Z",
    role: "user",
    content: "what is alpine js please?",
    parts: [
      {
        type: "text",
        text: "what is alpine js please?",
      },
    ],
  },
  {
    id: "msg-bzmARZlTCwuD34MG1y59KW1v",
    createdAt: "2025-06-29T11:00:51.263Z",
    role: "assistant",
    content:
      "Alpine.js is a modern JavaScript library that allows developers to embed JavaScript code directly in HTML, similar to the `on*` attributes in plain HTML and JavaScript, but with more capabilities. It is a single-file, dependency-free library that can be installed via CDN or a package manager. Alpine.js provides a set of HTML attributes, all prefixed with `x-`, with `x-data` being the main one. It is considered a modern replacement for jQuery.\n",
    parts: [
      {
        type: "step-start",
      },
      {
        type: "text",
        text: "Alpine.js is a modern JavaScript library that allows developers to embed JavaScript code directly in HTML, similar to the `on*` attributes in plain HTML and JavaScript, but with more capabilities. It is a single-file, dependency-free library that can be installed via CDN or a package manager. Alpine.js provides a set of HTML attributes, all prefixed with `x-`, with `x-data` being the main one. It is considered a modern replacement for jQuery.\n",
      },
    ],
    revisionId: "Dk6Wgr91pJkUKuOM",
  },
  {
    id: "UsezNOdr6Q6SxigK",
    createdAt: "2025-06-29T11:01:26.429Z",
    role: "user",
    content:
      "using your knowledge base can you compare jquery to alpine.js use table please?",
    parts: [
      {
        type: "text",
        text: "using your knowledge base can you compare jquery to alpine.js use table please?",
      },
    ],
  },
  {
    id: "KobYhrR7UUjlXZ11",
    createdAt: "2025-06-29T11:01:52.635Z",
    role: "user",
    content:
      "now create code comparision using alpine and jquery? key differences?",
    parts: [
      {
        type: "text",
        text: "now create code comparision using alpine and jquery? key differences?",
      },
    ],
  },
];

const codeMessage = {
  id: "msg-RfjFhGxoF3ruHYoz2nPRvt5X",
  createdAt: "2025-06-29T11:01:53.619Z",
  role: "assistant",
  content:
    'Okay, here\'s a code comparison highlighting key differences between jQuery and Alpine.js for a simple task: showing/hiding an element on button click.\n\n**Scenario:** A button that toggles the visibility of a paragraph.\n\n**1. jQuery**\n\n```html\n<!DOCTYPE html>\n<html>\n<head>\n<title>jQuery Example</title>\n<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>\n<script>\n$(document).ready(function(){\n  $("#toggleButton").click(function(){\n    $("#myParagraph").toggle();\n  });\n});\n</script>\n</head>\n<body>\n\n<button id="toggleButton">Toggle Paragraph</button>\n<p id="myParagraph">This is a paragraph.</p>\n\n</body>\n</html>\n```\n\n**Explanation (jQuery):**\n\n*   **External JavaScript:**  jQuery code typically resides in a separate `<script>` block or file.\n*   **DOM Traversal:**  `$("#toggleButton")` uses jQuery\'s selector engine to find the button element in the DOM.\n*   **Event Handling:**  `.click()` attaches a click event handler to the button.\n*   **Imperative DOM Manipulation:**  `$("#myParagraph").toggle()` directly manipulates the DOM to show or hide the paragraph.  You\'re telling jQuery *how* to change the DOM.\n\n**2. Alpine.js**\n\n```html\n<!DOCTYPE html>\n<html>\n<head>\n<title>Alpine.js Example</title>\n<script src="https://unpkg.com/alpinejs" defer></script>\n</head>\n<body>\n\n<div x-data="{ isVisible: true }">\n  <button @click="isVisible = ! isVisible">Toggle Paragraph</button>\n  <p x-show="isVisible">This is a paragraph.</p>\n</div>\n\n</body>\n</html>\n```\n\n**Explanation (Alpine.js):**\n\n*   **Inline JavaScript (Declarative):** Alpine.js code is embedded directly within the HTML using `x-` attributes.\n*   **`x-data`:**  Initializes a component with data.  `isVisible` is a boolean property that controls the paragraph\'s visibility.\n*   **`@click`:**  A shorthand for `x-on:click`.  It binds a click event to the button.  The expression `isVisible = ! isVisible` toggles the value of `isVisible` when the button is clicked.\n*   **`x-show`:**  Conditionally shows or hides the paragraph based on the value of `isVisible`.  You\'re telling Alpine.js *what* state the DOM should be in, not *how* to achieve it.\n\n**Key Differences Highlighted:**\n\n*   **Inline vs. External Scripting:** Alpine.js encourages inline scripting, while jQuery typically uses external JavaScript files.\n*   **Declarative vs. Imperative:** Alpine.js uses a declarative approach (you describe the desired state), while jQuery uses an imperative approach (you tell the library how to manipulate the DOM).\n*   **Data Binding:** Alpine.js uses data binding (`x-show="isVisible"`) to automatically update the DOM when the data changes. jQuery requires manual DOM manipulation.\n*   **Component-Based:** Alpine.js encourages a component-based approach with `x-data`, making it easier to manage state and behavior within specific parts of your HTML. jQuery is more focused on global DOM manipulation.\n*   **Conciseness:** For simple interactions, Alpine.js can often achieve the same result with less code.\n\nIn summary, Alpine.js offers a more modern, declarative, and often more concise way to add dynamic behavior to your HTML compared to jQuery\'s more traditional, imperative approach.  The choice depends on the complexity of your project and your preferred coding style.\n',
  parts: [
    {
      type: "step-start",
    },
    {
      type: "text",
      text: 'Okay, here\'s a code comparison highlighting key differences between jQuery and Alpine.js for a simple task: showing/hiding an element on button click.\n\n**Scenario:** A button that toggles the visibility of a paragraph.\n\n**1. jQuery**\n\n```html\n<!DOCTYPE html>\n<html>\n<head>\n<title>jQuery Example</title>\n<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>\n<script>\n$(document).ready(function(){\n  $("#toggleButton").click(function(){\n    $("#myParagraph").toggle();\n  });\n});\n</script>\n</head>\n<body>\n\n<button id="toggleButton">Toggle Paragraph</button>\n<p id="myParagraph">This is a paragraph.</p>\n\n</body>\n</html>\n```\n\n**Explanation (jQuery):**\n\n*   **External JavaScript:**  jQuery code typically resides in a separate `<script>` block or file.\n*   **DOM Traversal:**  `$("#toggleButton")` uses jQuery\'s selector engine to find the button element in the DOM.\n*   **Event Handling:**  `.click()` attaches a click event handler to the button.\n*   **Imperative DOM Manipulation:**  `$("#myParagraph").toggle()` directly manipulates the DOM to show or hide the paragraph.  You\'re telling jQuery *how* to change the DOM.\n\n**2. Alpine.js**\n\n```html\n<!DOCTYPE html>\n<html>\n<head>\n<title>Alpine.js Example</title>\n<script src="https://unpkg.com/alpinejs" defer></script>\n</head>\n<body>\n\n<div x-data="{ isVisible: true }">\n  <button @click="isVisible = ! isVisible">Toggle Paragraph</button>\n  <p x-show="isVisible">This is a paragraph.</p>\n</div>\n\n</body>\n</html>\n```\n\n**Explanation (Alpine.js):**\n\n*   **Inline JavaScript (Declarative):** Alpine.js code is embedded directly within the HTML using `x-` attributes.\n*   **`x-data`:**  Initializes a component with data.  `isVisible` is a boolean property that controls the paragraph\'s visibility.\n*   **`@click`:**  A shorthand for `x-on:click`.  It binds a click event to the button.  The expression `isVisible = ! isVisible` toggles the value of `isVisible` when the button is clicked.\n*   **`x-show`:**  Conditionally shows or hides the paragraph based on the value of `isVisible`.  You\'re telling Alpine.js *what* state the DOM should be in, not *how* to achieve it.\n\n**Key Differences Highlighted:**\n\n*   **Inline vs. External Scripting:** Alpine.js encourages inline scripting, while jQuery typically uses external JavaScript files.\n*   **Declarative vs. Imperative:** Alpine.js uses a declarative approach (you describe the desired state), while jQuery uses an imperative approach (you tell the library how to manipulate the DOM).\n*   **Data Binding:** Alpine.js uses data binding (`x-show="isVisible"`) to automatically update the DOM when the data changes. jQuery requires manual DOM manipulation.\n*   **Component-Based:** Alpine.js encourages a component-based approach with `x-data`, making it easier to manage state and behavior within specific parts of your HTML. jQuery is more focused on global DOM manipulation.\n*   **Conciseness:** For simple interactions, Alpine.js can often achieve the same result with less code.\n\nIn summary, Alpine.js offers a more modern, declarative, and often more concise way to add dynamic behavior to your HTML compared to jQuery\'s more traditional, imperative approach.  The choice depends on the complexity of your project and your preferred coding style.\n',
    },
  ],
  revisionId: "EijcTazUrAEwpccw",
};

const tableMessage = {
  id: "msg-lWeOpA1Tw4WzkBrKzdLkkxAL",
  createdAt: "2025-06-29T11:01:27.370Z",
  role: "assistant",
  content:
    "| Feature          | jQuery                                  | Alpine.js                               |\n|-------------------|-----------------------------------------|-----------------------------------------|\n| **Purpose**       | DOM manipulation, event handling, AJAX, utilities | Adding dynamic behavior to HTML       |\n| **Approach**      | Manipulates the DOM imperatively from JavaScript | Embeds JavaScript directly in HTML    |\n| **Dependencies**  | None                                      | None                                      |\n| **Size**          | Larger                                    | Smaller                                   |\n| **Learning Curve**| Steeper (requires understanding of the DOM and jQuery's API) | Easier (focuses on declarative behavior) |\n| **Use Cases**     | Complex web applications, large-scale DOM manipulation | Enhancing existing HTML with dynamic behavior, smaller projects |\n| **Modernity**     | Older library                             | Relatively new library                  |\n",
  parts: [
    {
      type: "step-start",
    },
    {
      type: "text",
      text: "| Feature          | jQuery                                  | Alpine.js                               |\n|-------------------|-----------------------------------------|-----------------------------------------|\n| **Purpose**       | DOM manipulation, event handling, AJAX, utilities | Adding dynamic behavior to HTML       |\n| **Approach**      | Manipulates the DOM imperatively from JavaScript | Embeds JavaScript directly in HTML    |\n| **Dependencies**  | None                                      | None                                      |\n| **Size**          | Larger                                    | Smaller                                   |\n| **Learning Curve**| Steeper (requires understanding of the DOM and jQuery's API) | Easier (focuses on declarative behavior) |\n| **Use Cases**     | Complex web applications, large-scale DOM manipulation | Enhancing existing HTML with dynamic behavior, smaller projects |\n| **Modernity**     | Older library                             | Relatively new library                  |\n",
    },
  ],
  revisionId: "3Vzh7aOy72Ceh3tW",
};

export const fakeMessages = [
  ...conversationMessages,
  tableMessage,
  codeMessage,
];
