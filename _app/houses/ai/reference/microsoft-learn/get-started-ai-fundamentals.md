# Introduction to AI concepts

**Module slug:** `get-started-ai-fundamentals`
**Source:** https://learn.microsoft.com/en-us/training/modules/get-started-ai-fundamentals/
**Units:** 10

## Table of Contents

1. Introduction to AI
2. Generative AI and agents
3. Text and natural language
4. Speech
5. Computer vision
6. Information extraction
7. Responsible AI
8. Exercise - Explore a simple AI agent
9. Module assessment
10. Summary

---


# Introduction to AI

- 2 minutes
Welcome!
You're presumably here because you want to learn more about artificial intelligence (AI). Maybe you've heard about AI in the media and want to know more; or maybe you're going to be adopting AI at work or in school, and want to know more about what to expect.
This training module is designed to provide a high-level overview of some core capabilities of artificial intelligence (AI) and give you an intuition of how they work. It's not a deeply technical module, and we won't be writing any code or getting into the mathematical details of the machine learning models on which AI is built. Instead, we'll focus on understanding the kinds of things that AI can do, and the basic principles on which it's based.
So, let's go! Move on to the next unit and we'll start our exploration of AI.
Note
We recognize that different people like to learn in different ways. You can choose to complete this module in video-based format or you can read the content as text and images. The text contains greater detail than the videos, so in some cases you might want to refer to it as supplemental material to the video presentation.

---


# Generative AI and agents

- 3 minutes
Note
See the Text and images tab for more details!
Generative AI is a branch of AI that enables software applications to generate new content; often natural language dialogs, but also images, video, code, and other formats. The ability to generate content is based on a language model , which has been trained with huge volumes of data - often documents from the Internet or other public sources of information.
Users interact with generative AI language models through prompts - natural language statements of questions. The language model in a generative AI solution uses the prompt to initiate the generation of a meaningful response.
Generative AI models encapsulate semantic relationships between language elements (that's a fancy way of saying that the models "know" how words relate to one another), and that's what enables them to generate a meaningful sequence of text.
There are large language models (LLMs) and small language models (SLMs) - the difference is based on the volume of data and the number of variables in the model. LLMs are powerful and generalize well, but can be more costly to train and use. SLMs tend to work well in scenarios that are more focused on specific topic areas or that require easily deployed small models for local applications and agents on devices.

## Generative AI scenarios

Common uses of generative AI include:
- Implementing AI agents that assist human users by providing information or automating tasks.
- Creating new documents or other content (often as a starting point for further iterative development)
- Automated translation of text between languages.
- Summarizing or explaining complex documents.

---


# Text and natural language

- 3 minutes
Note
See the Text and images tab for more details!
Natural language processing (NLP) is a broad term that covers AI models and techniques for making sense of language. NLP is the foundation on which generative AI large language models (LLMs) are built.
While many natural language processing scenarios are handled by generative AI models today, there are common text analysis use cases where simpler NLP language models can be more cost-effective.
- Text classification - assigning document to a specific category; including sentiment analysis to determine whether a body of text is positive, negative, or neutral.
- Key-term extraction and entity detection - identifying key words or phrases in a document, and finding mentions of entities like people, places, organizations.
- Summarization - Reducing the volume of text while still encapsulating the main points.

## Text analysis scenarios

Common uses of NLP technologies for text analysis include:
- Analyzing document or transcripts of calls and meetings to determine key subjects and identify specific mentions of people, places, organizations, products, or other entities.
- Analyzing social media posts, product reviews, or articles to evaluate sentiment and opinion.
- Implementing chatbots that can answer frequently asked questions or orchestrate predictable conversational dialogs that don't require the complexity of generative AI.

---


# Speech

- 3 minutes
Note
See the Text and images tab for more details!
Speech capabilities in AI applications and agents enable users to interact with them through spoken language.

## Speech recognition

Speech recognition is the ability of AI to "hear" and interpret speech. Usually this capability takes the form of speech-to-text (where the audio signal for the speech is transcribed into text).

## Speech synthesis

Speech synthesis is the ability of AI to vocalize words as spoken language. Usually this capability takes the form of text-to-speech in which information in text format is converted into an audible signal.
AI speech technology is evolving rapidly to handle challenges like ignoring background noise, detecting interruptions, and generating increasingly expressive and human-like voices.

## AI speech scenarios

Common uses of AI speech technologies include:
- AI agents that understand spoken input, perform tasks, and respond with spoken results.
- Automated transcription of calls or meetings.
- Automating audio descriptions of video or text.
- Automated speech translation between languages.

---


# Computer vision

- 3 minutes
Note
See the Text and images tab for more details!
Computer vision is the area of artificial intelligence that deals with the analysis of visual input; such as photographs, videos, and live camera feeds. Computer vision is accomplished by using large numbers of images to train a model.
There are multiple types of computer vision model.
- Image classification is a form of computer vision in which a model is trained with images that are labeled with the main subject of the image (in other words, what it's an image of ) so that it can analyze unlabeled images and predict the most appropriate label - identifying the subject of the image.
- Object detection is a form of computer vision in which the model is trained to identify the location of specific objects in an image.
- Semantic segmentation is an advanced form of object detection where, rather than indicate an object's location by drawing a box around it, the model can identify the individual pixels in the image that belong to a particular object.
- Multi-modal models combine visual features and associated text descriptions, enabling them to generate comprehensive descriptions of images.

## Computer vision scenarios

Common uses of computer vision include:
- Ai agents that can interpret visual input.
- Auto-captioning or tag-generation for photographs.
- Visual search.
- Monitoring stock levels or identifying items for checkout in retail scenarios.
- Security video monitoring.
- Authentication through facial recognition.
- Robotics and self-driving vehicles.

---


# Information extraction

- 3 minutes
Note
See the Text and images tab for more details!
AI is commonly used to automate information extraction solutions that find information and unlock insights in unstructured data sources, such as scanned documents and forms, images, and audio or video recordings.
The basis for most document analysis solutions is a computer vision technology called optical character recognition (OCR), which can identify the location of text in an image. OCR is often combined with an analytical model that can interpret individual values in the document, and so extract specific fields.
While most data extraction models have historically focused on extracting fields from text-based forms, more advanced models that can extract information from audio recording, images, and videos are becoming more readily available.

## Data and insight extraction scenarios

Common uses of AI to extract data and insights include:
- Automated processing of forms and other documents in a business process - for example, processing an expense claim.
- Large-scale digitization of data from paper forms. For example, scanning and archiving census records.
- Indexing documents for search.
- Identifying key points and follow-up actions from meeting transcripts or recordings.

---


# Responsible AI

- 3 minutes
Note
See the Text and images tab for more details!
Principles for responsible AI include:
| Principle | Description |
|---|---|
| Fairness | AI models are trained using data, which is generally sourced and selected by humans. There's substantial risk that the data selection criteria, or the data itself reflects unconsciousbiasthat may cause a model to produce discriminatory outputs. AI developers need to take care to minimize bias in training data and test AI systems for fairness. |
| Reliability and safety | AI is based on probabilistic models, it is not infallible. AI-powered applications need to take this into account and mitigate risks accordingly. |
| Privacy and security | Models are trained using data, which may include personal information. AI developers have a responsibility to ensure that the training data is kept secure, and that the trained models themselves can't be used to reveal private personal or organizational details. |
| Inclusiveness | The potential of AI to improve lives and drive success should be open to everyone. AI developers should strive to ensure that their solutions don't exclude some users. |
| Transparency | AI can sometimes seem like "magic", but it's important to make users aware of how the system works and any potential limitations it may have. |
| Accountability | Ultimately, the people and organizations that develop and distribute AI solutions are accountable for their actions. It's important for organizations developing AI models and applications to define and apply a framework of governance to help ensure that they apply responsible AI principles to their work. |

## Responsible AI examples

Some example of scenarios where responsible AI practices should be applied include:
- An AI-powered college admissions system should be tested to ensure it evaluates all applications fairly, taking into account relevant academic criteria but avoiding unfounded discrimination based on irrelevant demographic factors.
- An AI-powered robotic solution that uses computer vision to detect objects should avoid unintentional harm or damage. One way to accomplish this goal is to use probability values to determine "confidence" in object identification before interacting with physical objects, and avoid any action if the confidence level is below a specific threshold.
- A facial identification system used in an airport or other secure area should delete personal images that are used for temporary access as soon as they're no longer required. Additionally, safeguards should prevent the images being made accessible to operators or users who have no need to view them.
- An AI agent that offers speech-based interaction should also generate text captions to avoid making the system unusable for users with a hearing impairment.
- A bank that uses an AI-based loan-approval application should disclose the use of AI, and describe features of the data on which it was trained (without revealing confidential information).

---


# Exercise - Explore a simple AI agent

- 15 minutes
You've learned a lot about AI, and the kinds of things it can do. Now it's your turn! In this exercise, you use a simple AI agent to ask AI-related questions and get helpful responses.

---


# Module assessment

- 3 minutes
Which is the most accurate description of generative AI?
Generative AI uses a language model to create original content in response to a prompt.
Generative AI is an older form of AI that's superseded by machine learning.
Generative AI is a complex form of AI that can only be used by specialists such as data scientists.
What is an AI agent?
A technology professional who builds AI applications.
Anyone who uses AI applications.
An AI application that can perform tasks on behalf of a user.
An AI application reads email aloud to a user. Which AI speech capability is being used?
Speech recognition
Speech synthesis
Sentiment analysis
You must answer all questions before checking your work.

---


# Summary

- 2 minutes
Note
See the Text and images tab for more details!
Hopefully, this module gave you an insight into some of the core capabilities of AI, and an intuition into how they work. We explored many areas of AI, including:
- Generative AI and agents
- Natural language processing (NLP) and text analytics
- Speech
- Computer vision
- Information extraction
- Responsible AI
Tip
Now that you have foundational understanding of AI, consider reviewing the following resources.
- To try Microsoft Copilot for yourself, go to https://copilot.microsoft.com .
- To learn more about Microsoft AI solutions, see the Microsoft AI page .
- To learn more about Microsoft's approach to responsible AI, see the Microsoft responsible AI page .

---

