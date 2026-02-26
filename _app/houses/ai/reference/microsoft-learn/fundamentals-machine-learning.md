# Introduction to machine learning concepts

**Module slug:** `fundamentals-machine-learning`
**Source:** https://learn.microsoft.com/en-us/training/modules/fundamentals-machine-learning/
**Units:** 11

## Table of Contents

1. Introduction
2. Machine learning models
3. Types of machine learning model
4. Regression
5. Binary classification
6. Multiclass classification
7. Clustering
8. Deep learning
9. Exercise - Explore machine learning scenarios
10. Module assessment
11. Summary

---


# Introduction

- 1 minute
Machine learning is in many ways the intersection of two disciplines - data science and software engineering. The goal of machine learning is to use data to create a predictive model that can be incorporated into a software application or service. To achieve this goal requires collaboration between data scientists who explore and prepare the data before using it to train a machine learning model, and software developers who integrate the models into applications where they're used to predict new data values (a process known as inferencing ).
Machine learning has its origins in statistics and mathematical modeling of data. The fundamental idea of machine learning is to use data from past observations to predict unknown outcomes or values. For example:
- The proprietor of an ice cream store might use an app that combines historical sales and weather records to predict how many ice creams they're likely to sell on a given day, based on the weather forecast.
- A doctor might use clinical data from past patients to run automated tests that predict whether a new patient is at risk from diabetes based on factors like weight, blood glucose level, and other measurements.
- A researcher in the Antarctic might use past observations to automate the identification of different penguin species (such as Adelie , Gentoo , or Chinstrap ) based on measurements of a bird's flippers, bill, and other physical attributes.
Note
We recognize that different people like to learn in different ways. You can choose to complete this module in video-based format or you can read the content as text and images. The text contains greater detail than the videos, so in some cases you might want to refer to it as supplemental material to the video presentation.

---


# Machine learning models

- 5 minutes
Note
See the Text and images tab for more details!
Because machine learning is based on mathematics and statistics, it's common to think about machine learning models in mathematical terms. Fundamentally, a machine learning model is a software application that encapsulates a function to calculate an output value based on one or more input values. The process of defining that function is known as training . After the function has been defined, you can use it to predict new values in a process called inferencing .
Let's explore the steps involved in training and inferencing.
- The training data consists of past observations. In most cases, the observations include the observed attributes or features of the thing being observed, and the known value of the thing you want to train a model to predict (known as the label ). In mathematical terms, you'll often see the features referred to using the shorthand variable name x , and the label referred to as y . Usually, an observation consists of multiple feature values, so x is actually a vector (an array with multiple values), like this: [x 1 ,x 2 ,x 3 ,...] . To make this clearer, let's consider the examples described previously: In the ice cream sales scenario, our goal is to train a model that can predict the number of ice cream sales based on the weather. The weather measurements for the day (temperature, rainfall, windspeed, and so on) would be the features ( x ), and the number of ice creams sold on each day would be the label ( y ). In the medical scenario, the goal is to predict whether or not a patient is at risk of diabetes based on their clinical measurements. The patient's measurements (weight, blood glucose level, and so on) are the features ( x ), and the likelihood of diabetes (for example, 1 for at risk, 0 for not at risk) is the label ( y ). In the Antarctic research scenario, we want to predict the species of a penguin based on its physical attributes. The key measurements of the penguin (length of its flippers, width of its bill, and so on) are the features ( x ), and the species (for example, 0 for Adelie, 1 for Gentoo, or 2 for Chinstrap) is the label ( y ).
The training data consists of past observations. In most cases, the observations include the observed attributes or features of the thing being observed, and the known value of the thing you want to train a model to predict (known as the label ).
In mathematical terms, you'll often see the features referred to using the shorthand variable name x , and the label referred to as y . Usually, an observation consists of multiple feature values, so x is actually a vector (an array with multiple values), like this: [x 1 ,x 2 ,x 3 ,...] .
To make this clearer, let's consider the examples described previously:
- In the ice cream sales scenario, our goal is to train a model that can predict the number of ice cream sales based on the weather. The weather measurements for the day (temperature, rainfall, windspeed, and so on) would be the features ( x ), and the number of ice creams sold on each day would be the label ( y ).
- In the medical scenario, the goal is to predict whether or not a patient is at risk of diabetes based on their clinical measurements. The patient's measurements (weight, blood glucose level, and so on) are the features ( x ), and the likelihood of diabetes (for example, 1 for at risk, 0 for not at risk) is the label ( y ).
- In the Antarctic research scenario, we want to predict the species of a penguin based on its physical attributes. The key measurements of the penguin (length of its flippers, width of its bill, and so on) are the features ( x ), and the species (for example, 0 for Adelie, 1 for Gentoo, or 2 for Chinstrap) is the label ( y ).
- An algorithm is applied to the data to try to determine a relationship between the features and the label, and generalize that relationship as a calculation that can be performed on x to calculate y . The specific algorithm used depends on the kind of predictive problem you're trying to solve (more about this later), but the basic principle is to try to fit the data to a function in which the values of the features can be used to calculate the label.
- The result of the algorithm is a model that encapsulates the calculation derived by the algorithm as a function - let's call it f . In mathematical notation: y = f(x)
The result of the algorithm is a model that encapsulates the calculation derived by the algorithm as a function - let's call it f . In mathematical notation:
y = f(x)
- Now that the training phase is complete, the trained model can be used for inferencing . The model is essentially a software program that encapsulates the function produced by the training process. You can input a set of feature values, and receive as an output a prediction of the corresponding label. Because the output from the model is a prediction that was calculated by the function, and not an observed value, you'll often see the output from the function shown as Å· (which is rather delightfully verbalized as "y-hat").

---


# Types of machine learning model

- 10 minutes
Note
See the Text and images tab for more details!
There are multiple types of machine learning, and you must apply the appropriate type depending on what you're trying to predict. A breakdown of common types of machine learning is shown in the following diagram.

## Supervised machine learning

Supervised machine learning is a general term for machine learning algorithms in which the training data includes both feature values and known label values. Supervised machine learning is used to train models by determining a relationship between the features and labels in past observations, so that unknown labels can be predicted for features in future cases.

### Regression

Regression is a form of supervised machine learning in which the label predicted by the model is a numeric value. For example:
- The number of ice creams sold on a given day, based on the temperature, rainfall, and windspeed.
- The selling price of a property based on its size in square feet, the number of bedrooms it contains, and socio-economic metrics for its location.
- The fuel efficiency (in miles-per-gallon) of a car based on its engine size, weight, width, height, and length.

### Classification

Classification is a form of supervised machine learning in which the label represents a categorization, or class . There are two common classification scenarios.

#### Binary classification

In binary classification , the label determines whether the observed item is (or isn't ) an instance of a specific class. Or put another way, binary classification models predict one of two mutually exclusive outcomes. For example:
- Whether a patient is at risk for diabetes based on clinical metrics like weight, age, blood glucose level, and so on.
- Whether a bank customer will default on a loan based on income, credit history, age, and other factors.
- Whether a mailing list customer will respond positively to a marketing offer based on demographic attributes and past purchases.
In all of these examples, the model predicts a binary true / false or positive/negative prediction for a single possible class.

#### Multiclass classification

Multiclass classification extends binary classification to predict a label that represents one of multiple possible classes. For example,
- The species of a penguin ( Adelie , Gentoo , or Chinstrap ) based on its physical measurements.
- The genre of a movie ( comedy , horror , romance , adventure , or science fiction ) based on its cast, director, and budget.
In most scenarios that involve a known set of multiple classes, multiclass classification is used to predict mutually exclusive labels. For example, a penguin can't be both a Gentoo and an Adelie . However, there are also some algorithms that you can use to train multilabel classification models, in which there may be more than one valid label for a single observation. For example, a movie could potentially be categorized as both science fiction and comedy .

## Unsupervised machine learning

Unsupervised machine learning involves training models using data that consists only of feature values without any known labels. Unsupervised machine learning algorithms determine relationships between the features of the observations in the training data.

### Clustering

The most common form of unsupervised machine learning is clustering . A clustering algorithm identifies similarities between observations based on their features, and groups them into discrete clusters. For example:
- Group similar flowers based on their size, number of leaves, and number of petals.
- Identify groups of similar customers based on demographic attributes and purchasing behavior.
In some ways, clustering is similar to multiclass classification; in that it categorizes observations into discrete groups. The difference is that when using classification, you already know the classes to which the observations in the training data belong; so the algorithm works by determining the relationship between the features and the known classification label. In clustering, there's no previously known cluster label and the algorithm groups the data observations based purely on similarity of features.
In some cases, clustering is used to determine the set of classes that exist before training a classification model. For example, you might use clustering to segment your customers into groups, and then analyze those groups to identify and categorize different classes of customer ( high value - low volume , frequent small purchaser , and so on). You could then use your categorizations to label the observations in your clustering results and use the labeled data to train a classification model that predicts to which customer category a new customer might belong.

---


# Regression

- 12 minutes
Note
See the Text and images tab for more details!
Regression models are trained to predict numeric label values based on training data that includes both features and known labels. The process for training a regression model (or indeed, any supervised machine learning model) involves multiple iterations in which you use an appropriate algorithm (usually with some parameterized settings) to train a model, evaluate the model's predictive performance, and refine the model by repeating the training process with different algorithms and parameters until you achieve an acceptable level of predictive accuracy.
The diagram shows four key elements of the training process for supervised machine learning models:
- Split the training data (randomly) to create a dataset with which to train the model while holding back a subset of the data that you'll use to validate the trained model.
- Use an algorithm to fit the training data to a model. In the case of a regression model, use a regression algorithm such as linear regression .
- Use the validation data you held back to test the model by predicting labels for the features.
- Compare the known actual labels in the validation dataset to the labels that the model predicted. Then aggregate the differences between the predicted and actual label values to calculate a metric that indicates how accurately the model predicted for the validation data.
After each train, validate, and evaluate iteration, you can repeat the process with different algorithms and parameters until an acceptable evaluation metric is achieved.

## Example - regression

Let's explore regression with a simplified example in which we'll train a model to predict a numeric label ( y ) based on a single feature value ( x ). Most real scenarios involve multiple feature values, which adds some complexity; but the principle is the same.
For our example, let's stick with the ice cream sales scenario we discussed previously. For our feature, we'll consider the temperature (let's assume the value is the maximum temperature on a given day), and the label we want to train a model to predict is the number of ice creams sold that day. We'll start with some historic data that includes records of daily temperatures ( x ) and ice cream sales ( y ):
|  |  |
|---|---|
| Temperature (x) | Ice cream sales (y) |
| 51 | 1 |
| 52 | 0 |
| 67 | 14 |
| 65 | 14 |
| 70 | 23 |
| 69 | 20 |
| 72 | 23 |
| 75 | 26 |
| 73 | 22 |
| 81 | 30 |
| 78 | 26 |
| 83 | 36 |

### Training a regression model

We'll start by splitting the data and using a subset of it to train a model. Here's the training dataset:
| Temperature (x) | Ice cream sales (y) |
|---|---|
| 51 | 1 |
| 65 | 14 |
| 69 | 20 |
| 72 | 23 |
| 75 | 26 |
| 81 | 30 |
To get an insight of how these x and y values might relate to one another, we can plot them as coordinates along two axes, like this:
Now we're ready to apply an algorithm to our training data and fit it to a function that applies an operation to x to calculate y . One such algorithm is linear regression , which works by deriving a function that produces a straight line through the intersections of the x and y values while minimizing the average distance between the line and the plotted points, like this:
The line is a visual representation of the function in which the slope of the line describes how to calculate the value of y for a given value of x . The line intercepts the x axis at 50, so when x is 50, y is 0. As you can see from the axis markers in the plot, the line slopes so that every increase of 5 along the x axis results in an increase of 5 up the y axis; so when x is 55, y is 5; when x is 60, y is 10, and so on. To calculate a value of y for a given value of x , the function simply subtracts 50; in other words, the function can be expressed like this:
f (x) = x-50
You can use this function to predict the number of ice creams sold on a day with any given temperature. For example, suppose the weather forecast tells us that tomorrow it will be 77 degrees. We can apply our model to calculate 77-50 and predict that we'll sell 27 ice creams tomorrow.
But just how accurate is our model?

### Evaluating a regression model

To validate the model and evaluate how well it predicts, we held back some data for which we know the label ( y ) value. Here's the data we held back:
| Temperature (x) | Ice cream sales (y) |
|---|---|
| 52 | 0 |
| 67 | 14 |
| 70 | 23 |
| 73 | 22 |
| 78 | 26 |
| 83 | 36 |
We can use the model to predict the label for each of the observations in this dataset based on the feature ( x ) value; and then compare the predicted label ( Å· ) to the known actual label value ( y ).
Using the model we trained earlier, which encapsulates the function f (x) = x-50 , results in the following predictions:
| Temperature (x) | Actual sales (y) | Predicted sales (Å·) |
|---|---|---|
| 52 | 0 | 2 |
| 67 | 14 | 17 |
| 70 | 23 | 20 |
| 73 | 22 | 23 |
| 78 | 26 | 28 |
| 83 | 36 | 33 |
We can plot both the predicted and actual labels against the feature values like this:
The predicted labels are calculated by the model so they're on the function line, but there's some variance between the Å· values calculated by the function and the actual y values from the validation dataset; which is indicated on the plot as a line between the Å· and y values that shows how far off the prediction was from the actual value.

### Regression evaluation metrics

Based on the differences between the predicted and actual values, you can calculate some common metrics that are used to evaluate a regression model.

#### Mean Absolute Error (MAE)

The variance in this example indicates by how many ice creams each prediction was wrong. It doesn't matter if the prediction was over or under the actual value (so for example, -3 and +3 both indicate a variance of 3). This metric is known as the absolute error for each prediction, and can be summarized for the whole validation set as the mean absolute error (MAE).
In the ice cream example, the mean (average) of the absolute errors (2, 3, 3, 1, 2, and 3) is 2.33 .

#### Mean Squared Error (MSE)

The mean absolute error metric takes all discrepancies between predicted and actual labels into account equally. However, it may be more desirable to have a model that is consistently wrong by a small amount than one that makes fewer, but larger errors. One way to produce a metric that "amplifies" larger errors by squaring the individual errors and calculating the mean of the squared values. This metric is known as the mean squared error (MSE).
In our ice cream example, the mean of the squared absolute values (which are 4, 9, 9, 1, 4, and 9) is 6 .

#### Root Mean Squared Error (RMSE)

The mean squared error helps take the magnitude of errors into account, but because it squares the error values, the resulting metric no longer represents the quantity measured by the label. In other words, we can say that the MSE of our model is 6, but that doesn't measure its accuracy in terms of the number of ice creams that were mispredicted; 6 is just a numeric score that indicates the level of error in the validation predictions.
If we want to measure the error in terms of the number of ice creams, we need to calculate the square root of the MSE; which produces a metric called, unsurprisingly, Root Mean Squared Error . In this case â6, which is 2.45 (ice creams).

#### Coefficient of determination (R 2 )

All of the metrics so far compare the discrepancy between the predicted and actual values in order to evaluate the model. However, in reality, there's some natural random variance in the daily sales of ice cream that the model takes into account. In a linear regression model, the training algorithm fits a straight line that minimizes the mean variance between the function and the known label values. The coefficient of determination (more commonly referred to as R 2 or R-Squared ) is a metric that measures the proportion of variance in the validation results that can be explained by the model, as opposed to some anomalous aspect of the validation data (for example, a day with a highly unusual number of ice creams sales because of a local festival).
The calculation for R 2 is more complex than for the previous metrics. It compares the sum of squared differences between predicted and actual labels with the sum of squared differences between the actual label values and the mean of actual label values, like this:
R 2 = 1- â(y-Å·) 2 Ã· â(y-yÌ) 2
Don't worry too much if that looks complicated; most machine learning tools can calculate the metric for you. The important point is that the result is a value between 0 and 1 that describes the proportion of variance explained by the model. In simple terms, the closer to 1 this value is, the better the model is fitting the validation data. In the case of the ice cream regression model, the R 2 calculated from the validation data is 0.95 .

## Iterative training

The metrics described above are commonly used to evaluate a regression model. In most real-world scenarios, a data scientist will use an iterative process to repeatedly train and evaluate a model, varying:
- Feature selection and preparation (choosing which features to include in the model, and calculations applied to them to help ensure a better fit).
- Algorithm selection (We explored linear regression in the previous example, but there are many other regression algorithms)
- Algorithm parameters (numeric settings to control algorithm behavior, more accurately called hyperparameters to differentiate them from the x and y parameters).
After multiple iterations, the model that results in the best evaluation metric that's acceptable for the specific scenario is selected.

---


# Binary classification

- 12 minutes
Note
See the Text and images tab for more details!
Classification, like regression, is a supervised machine learning technique; and therefore follows the same iterative process of training, validating, and evaluating models. Instead of calculating numeric values like a regression model, the algorithms used to train classification models calculate probability values for class assignment and the evaluation metrics used to assess model performance compare the predicted classes to the actual classes.
Binary classification algorithms are used to train a model that predicts one of two possible labels for a single class. Essentially, predicting true or false . In most real scenarios, the data observations used to train and validate the model consist of multiple feature ( x ) values and a y value that is either 1 or 0 .

## Example - binary classification

To understand how binary classification works, let's look at a simplified example that uses a single feature ( x ) to predict whether the label y is 1 or 0. In this example, we'll use the blood glucose level of a patient to predict whether or not the patient has diabetes. Here's the data with which we'll train the model:
|  |  |
|---|---|
| Blood glucose (x) | Diabetic? (y) |
| 67 | 0 |
| 103 | 1 |
| 114 | 1 |
| 72 | 0 |
| 116 | 1 |
| 65 | 0 |

### Training a binary classification model

To train the model, we'll use an algorithm to fit the training data to a function that calculates the probability of the class label being true (in other words, that the patient has diabetes). Probability is measured as a value between 0.0 and 1.0, such that the total probability for all possible classes is 1.0. So for example, if the probability of a patient having diabetes is 0.7, then there's a corresponding probability of 0.3 that the patient isn't diabetic.
There are many algorithms that can be used for binary classification, such as logistic regression , which derives a sigmoid (S-shaped) function with values between 0.0 and 1.0, like this:
Despite its name, in machine learning logistic regression is used for classification, not regression. The important point is the logistic nature of the function it produces, which describes an S-shaped curve between a lower and upper value (0.0 and 1.0 when used for binary classification).
The function produced by the algorithm describes the probability of y being true ( y =1) for a given value of x . Mathematically, you can express the function like this:
f(x) = P(y=1 | x)
For three of the six observations in the training data, we know that y is definitely true , so the probability for those observations that y =1 is 1.0 and for the other three, we know that y is definitely false , so the probability that y =1 is 0.0 . The S-shaped curve describes the probability distribution so that plotting a value of x on the line identifies the corresponding probability that y is 1 .
The diagram also includes a horizontal line to indicate the threshold at which a model based on this function will predict true ( 1 ) or false ( 0 ). The threshold lies at the mid-point for y ( P(y) = 0.5 ). For any values at this point or above, the model will predict true ( 1 ); while for any values below this point it will predict false ( 0 ). For example, for a patient with a blood glucose level of 90, the function would result in a probability value of 0.9. Since 0.9 is higher than the threshold of 0.5, the model would predict true ( 1 ) - in other words, the patient is predicted to have diabetes.

### Evaluating a binary classification model

As with regression, when training a binary classification model you hold back a random subset of data with which to validate the trained model. Let's assume we held back the following data to validate our diabetes classifier:
| Blood glucose (x) | Diabetic? (y) |
|---|---|
| 66 | 0 |
| 107 | 1 |
| 112 | 1 |
| 71 | 0 |
| 87 | 1 |
| 89 | 1 |
Applying the logistic function we derived previously to the x values results in the following plot.
Based on whether the probability calculated by the function  is above or below the threshold, the model generates a predicted label of 1 or 0 for each observation. We can then compare the predicted class labels ( Å· ) to the actual class labels ( y ), as shown here:
| Blood glucose (x) | Actual diabetes diagnosis (y) | Predicted diabetes diagnosis (Å·) |
|---|---|---|
| 66 | 0 | 0 |
| 107 | 1 | 1 |
| 112 | 1 | 1 |
| 71 | 0 | 0 |
| 87 | 1 | 0 |
| 89 | 1 | 1 |

### Binary classification evaluation metrics

The first step in calculating evaluation metrics for a binary classification model is usually to create a matrix of the number of correct and incorrect predictions for each possible class label:
This visualization is called a confusion matrix , and it shows the prediction totals where:
- Å·=0 and y=0: True negatives (TN)
- Å·=1 and y=0: False positives (FP)
- Å·=0 and y=1: False negatives (FN)
- Å·=1 and y=1: True positives (TP)
The arrangement of the confusion matrix is such that correct ( true ) predictions are shown in a diagonal line from top-left to bottom-right. Often, color-intensity is used to indicate the number of predictions in each cell, so a quick glance at a model that predicts well should reveal a deeply shaded diagonal trend.

#### Accuracy

The simplest metric you can calculate from the confusion matrix is accuracy - the proportion of predictions that the model got right. Accuracy is calculated as:
(TN+TP) Ã· (TN+FN+FP+TP)
In the case of our diabetes example, the calculation is:
(2+3) Ã· (2+1+0+3)
= 5 Ã· 6
= 0.83
So for our validation data, the diabetes classification model produced correct predictions 83% of the time.
Accuracy might initially seem like a good metric to evaluate a model, but consider this. Suppose 11% of the population has diabetes. You could create a model that always predicts 0 , and it would achieve an accuracy of 89%, even though it makes no real attempt to differentiate between patients by evaluating their features. What we really need is a deeper understanding of how the model performs at predicting 1 for positive cases and 0 for negative cases.

#### Recall

Recall is a metric that measures the proportion of positive cases that the model identified correctly. In other words, compared to the number of patients who have diabetes, how many did the model predict to have diabetes?
The formula for recall is:
TP Ã· (TP+FN)
For our diabetes example:
3 Ã· (3+1)
= 3 Ã· 4
= 0.75
So our model correctly identified 75% of patients who have diabetes as having diabetes.

#### Precision

Precision is a similar metric to recall, but measures the proportion of predicted positive cases where the true label is actually positive. In other words, what proportion of the patients predicted by the model to have diabetes actually have diabetes?
The formula for precision is:
TP Ã· (TP+FP)
3 Ã· (3+0)
= 3 Ã· 3
= 1.0
So 100% of the patients predicted by our model to have diabetes do in fact have diabetes.

#### F1-score

F1-score is an overall metric that combines recall and precision. The formula for F1-score is:
(2 x Precision x Recall) Ã· (Precision + Recall)
(2 x 1.0 x 0.75) Ã· (1.0 + 0.75)
= 1.5 Ã· 1.75
= 0.86

#### Area Under the Curve (AUC)

Another name for recall is the true positive rate (TPR), and there's an equivalent metric called the false positive rate (FPR) that is calculated as FPÃ·(FP+TN) . We already know that the TPR for our model when using a threshold of 0.5 is 0.75, and we can use the formula for FPR to calculate a value of 0Ã·2 = 0.
Of course, if we were to change the threshold above which the model predicts true ( 1 ), it would affect the number of positive and negative predictions; and therefore change the TPR and FPR metrics. These metrics are often used to evaluate a model by plotting a received operator characteristic (ROC) curve that compares the TPR and FPR for every possible threshold value between 0.0 and 1.0:
The ROC curve for a perfect model would go straight up the TPR axis on the left and then across the FPR axis at the top. Since the plot area for the curve measures 1x1, the area under this perfect curve would be 1.0 (meaning that the model is correct 100% of the time). In contrast, a diagonal line from the bottom-left to the top-right represents the results that would be achieved by randomly guessing a binary label; producing an area under the curve of 0.5. In other words, given two possible class labels, you could reasonably expect to guess correctly 50% of the time.
In the case of our diabetes model, the curve above is produced, and the area under the curve (AUC) metric is 0.875. Since the AUC is higher than 0.5, we can conclude the model performs better at predicting whether or not a patient has diabetes than randomly guessing.

---


# Multiclass classification

- 12 minutes
Note
See the Text and images tab for more details!
Multiclass classification is used to predict to which of multiple possible classes an observation belongs. As a supervised machine learning technique, it follows the same iterative train, validate, and evaluate process as regression and binary classification in which a subset of the training data is held back to validate the trained model.

## Example - multiclass classification

Multiclass classification algorithms are used to calculate probability values for multiple class labels, enabling a model to predict the most probable class for a given observation.
Let's explore an example in which we have some observations of penguins, in which the flipper length ( x ) of each penguin is recorded. For each observation, the data includes the penguin species ( y ), which is encoded as follows:
- 0: Adelie
- 1: Gentoo
- 2: Chinstrap
As with previous examples in this module, a real scenario would include multiple feature ( x ) values. We'll use a single feature to keep things simple.
|  |  |
|---|---|
| Flipper length (x) | Species (y) |
| 167 | 0 |
| 172 | 0 |
| 225 | 2 |
| 197 | 1 |
| 189 | 1 |
| 232 | 2 |
| 158 | 0 |

### Training a multiclass classification model

To train a multiclass classification model, we need to use an algorithm to fit the training data to a function that calculates a probability value for each possible class. There are two kinds of algorithm you can use to do this:
- One-vs-Rest (OvR) algorithms
- Multinomial algorithms
One-vs-Rest algorithms train a binary classification function for each class, each calculating the probability that the observation is an example of the target class. Each function calculates the probability of the observation being a specific class compared to any other class. For our penguin species classification model, the algorithm would essentially create three binary classification functions:
- f 0 (x) = P(y=0 | x)
- f 1 (x) = P(y=1 | x)
- f 2 (x) = P(y=2 | x)
Each algorithm produces a sigmoid function that calculates a probability value between 0.0 and 1.0. A model trained using this kind of algorithm predicts the class for the function that produces the highest probability output.
As an alternative approach is to use a multinomial algorithm, which creates a single function that returns a multi-valued output. The output is a vector (an array of values) that contains the probability distribution for all possible classes - with a probability score for each class which when totaled add up to 1.0:
f(x) =[P(y=0|x), P(y=1|x), P(y=2|x)]
An example of this kind of function is a softmax function, which could produce an output like the following example:
[0.2, 0.3, 0.5]
The elements in the vector represent the probabilities for classes 0, 1, and 2 respectively; so in this case, the class with the highest probability is 2 .
Regardless of which type of algorithm is used, the model uses the resulting function to determine the most probable class for a given set of features ( x ) and predicts the corresponding class label ( y ).

### Evaluating a multiclass classification model

You can evaluate a multiclass classifier by calculating binary classification metrics for each individual class. Alternatively, you can calculate aggregate metrics that take all classes into account.
Let's assume that we've validated our multiclass classifier, and obtained the following results:
| Flipper length (x) | Actual species (y) | Predicted species (Å·) |
|---|---|---|
| 165 | 0 | 0 |
| 171 | 0 | 0 |
| 205 | 2 | 1 |
| 195 | 1 | 1 |
| 183 | 1 | 1 |
| 221 | 2 | 2 |
| 214 | 2 | 2 |
The confusion matrix for a multiclass classifier is similar to that of a binary classifier, except that it shows the number of predictions for each combination of predicted ( Å· ) and actual class labels ( y ):
From this confusion matrix, we can determine the metrics for each individual class as follows:
| Class | True Positive | True Negative | False Positive | False Negative | Accuracy | Recall | Precision | F1-Score |
|---|---|---|---|---|---|---|---|---|
| 0 | 2 | 5 | 0 | 0 | 1.0 | 1.0 | 1.0 | 1.0 |
| 1 | 2 | 4 | 1 | 0 | 0.86 | 1.0 | 0.67 | 0.8 |
| 2 | 2 | 4 | 0 | 1 | 0.86 | 0.67 | 1.0 | 0.8 |
To calculate the overall accuracy, recall, and precision metrics, you use the total of the TP , TN , FP , and FN metrics:
- Overall accuracy = (13+6)Ã·(13+6+1+1) = 0.90
- Overall recall = 6Ã·(6+1) = 0.86
- Overall precision = 6Ã·(6+1) = 0.86
The overall F1-score is calculated using the overall recall and precision metrics:
- Overall F1-score = (2x0.86x0.86)Ã·(0.86+0.86) = 0.86

---


# Clustering

- 10 minutes
Note
See the Text and images tab for more details!
Clustering is a form of unsupervised machine learning in which observations are grouped into clusters based on similarities in their data values, or features. This kind of machine learning is considered unsupervised because it doesn't make use of previously known label values to train a model. In a clustering model, the label is the cluster to which the observation is assigned, based only on its features.

## Example - clustering

For example, suppose a botanist observes a sample of flowers and records the number of leaves and petals on each flower:
There are no known labels in the dataset, just two features . The goal is not to identify the different types (species) of flower; just to group similar flowers together based on the number of leaves and petals.
| Leaves(x1) | Petals(x2) |
|---|---|
| 0 | 5 |
| 0 | 6 |
| 1 | 3 |
| 1 | 3 |
| 1 | 6 |
| 1 | 8 |
| 2 | 3 |
| 2 | 7 |
| 2 | 8 |

### Training a clustering model

There are multiple algorithms you can use for clustering. One of the most commonly used algorithms is K-Means clustering, which consists of the following steps:
- The feature ( x ) values are vectorized to define n -dimensional coordinates (where n is the number of features). In the flower example, we have two features: number of leaves ( x 1 ) and number of petals ( x 2 ). So, the feature vector has two coordinates that we can use to conceptually plot the data points in two-dimensional space ( [x 1 ,x 2 ] )
- You decide how many clusters you want to use to group the flowers - call this value k . For example, to create three clusters, you would use a k value of 3. Then k points are plotted at random coordinates. These points become the center points for each cluster, so they're called centroids .
- Each data point (in this case a flower) is assigned to its nearest centroid.
- Each centroid is moved to the center of the data points assigned to it based on the mean distance between the points.
- After the centroid is moved, the data points may now be closer to a different centroid, so the data points are reassigned to clusters based on the new closest centroid.
- The centroid movement and cluster reallocation steps are repeated until the clusters become stable or a predetermined maximum number of iterations is reached.
The following animation shows this process:

### Evaluating a clustering model

Since there's no known label with which to compare the predicted cluster assignments, evaluation of a clustering model is based on how well the resulting clusters are separated from one another.
There are multiple metrics that you can use to evaluate cluster separation, including:
- Average distance to cluster center : How close, on average, each point in the cluster is to the centroid of the cluster.
- Average distance to other center : How close, on average, each point in the cluster is to the centroid of all other clusters.
- Maximum distance to cluster center : The furthest distance between a point in the cluster and its centroid.
- Silhouette : A value between -1 and 1 that summarizes the ratio of distance between points in the same cluster and points in different clusters (The closer to 1, the better the cluster separation).

---


# Deep learning

- 12 minutes
Note
See the Text and images tab for more details!
Deep learning is an advanced form of machine learning that tries to emulate the way the human brain learns. The key to deep learning is the creation of an artificial neural network that simulates electrochemical activity in biological neurons by using mathematical functions, as shown here.
| Biological neural network | Artificial neural network |
|---|---|
|  |  |
| Neurons fire in response to electrochemical stimuli. When fired, the signal is passed to connected neurons. | Each neuron is a function that operates on an input value (x) and aweight(w). The function is wrapped in anactivationfunction that determines whether to pass the output on. |
Artificial neural networks are made up of multiple layers of neurons - essentially defining a deeply nested function. This architecture is the reason the technique is referred to as deep learning and the models produced by it are often referred to as deep neural networks (DNNs). You can use deep neural networks for many kinds of machine learning problem, including regression and classification, as well as more specialized models for natural language processing and computer vision.
Just like other machine learning techniques discussed in this module, deep learning involves fitting training data to a function that can predict a label ( y ) based on the value of one or more features ( x ). The function ( f(x) ) is the outer layer of a nested function in which each layer of the neural network encapsulates functions that operate on x and the weight ( w ) values associated with them. The algorithm used to train the model involves iteratively feeding the feature values ( x ) in the training data forward through the layers to calculate output values for Å· , validating the model to evaluate how far off the calculated Å· values are from the known y values (which quantifies the level of error, or loss , in the model), and then modifying the weights ( w ) to reduce the loss. The trained model includes the final weight values that result in the most accurate predictions.

## Example - Using deep learning for classification

To better understand how a deep neural network model works, let's explore an example in which a neural network is used to define a classification model for penguin species.
The feature data ( x ) consists of some measurements of a penguin. Specifically, the measurements are:
- The length of the penguin's bill.
- The depth of the penguin's bill.
- The length of the penguin's flippers.
- The penguin's weight.
In this case, x is a vector of four values, or mathematically, x=[x1,x2,x3,x4] .
The label we're trying to predict ( y ) is the species of the penguin, and that there are three possible species it could be:
- Adelie
- Gentoo
- Chinstrap
This is an example of a classification problem, in which the machine learning model must predict the most probable class to which an observation belongs. A classification model accomplishes this by predicting a label that consists of the probability for each class. In other words, y is a vector of three probability values; one for each of the possible classes: [P(y=0|x), P(y=1|x), P(y=2|x)] .
The process for inferencing a predicted penguin class using this network is:
- The feature vector for a penguin observation is fed into the input layer of the neural network, which consists of a neuron for each x value. In this example, the following x vector is used as the input: [37.3, 16.8, 19.2, 30.0]
- The functions for the first layer of neurons each calculate a weighted sum by combining the x value and w weight, and pass it to an activation function that determines if it meets the threshold to be passed on to the next layer.
- Each neuron in a layer is connected to all of the neurons in the next layer (an architecture sometimes called a fully connected network ) so the results of each layer are fed forward through the network until they reach the output layer.
- The output layer produces a vector of values; in this case, using a softmax or similar function to calculate the probability distribution for the three possible classes of penguin. In this example, the output vector is: [0.2, 0.7, 0.1]
- The elements of the vector represent the probabilities for classes 0, 1, and 2. The second value is the highest, so the model predicts that the species of the penguin is 1 (Gentoo).

### How does a neural network learn?

The weights in a neural network are central to how it calculates predicted values for labels. During the training process, the model learns the weights that will result in the most accurate predictions. Let's explore the training process in a little more detail to understand how this learning takes place.
- The training and validation datasets are defined, and the training features are fed into the input layer.
- The neurons in each layer of the network apply their weights (which are initially assigned randomly) and feed the data through the network.
- The output layer produces a vector containing the calculated values for Å· . For example, an output for a penguin class prediction might be [0.3. 0.1. 0.6] .
- A loss function is used to compare the predicted Å· values to the known y values and aggregate the difference (which is known as the loss ). For example, if the known class for the case that returned the output in the previous step is Chinstrap , then the y value should be [0.0, 0.0, 1.0] . The absolute difference between this and the Å· vector is [0.3, 0.1, 0.4] . In reality, the loss function calculates the aggregate variance for multiple cases and summarizes it as a single loss value.
- Since the entire network is essentially one large nested function, an optimization function can use differential calculus to evaluate the influence of each weight in the network on the loss, and determine how they could be adjusted (up or down) to reduce the amount of overall loss. The specific optimization technique can vary, but usually involves a gradient descent approach in which each weight is increased or decreased to minimize the loss.
- The changes to the weights are backpropagated to the layers in the network, replacing the previously used values.
- The process is repeated over multiple iterations (known as epochs ) until the loss is minimized and the model predicts acceptably accurately.
While it's easier to think of each case in the training data being passed through the network one at a time, in reality the data is batched into matrices and processed using linear algebraic calculations. For this reason, neural network training is best performed on computers with graphical processing units (GPUs) that are optimized for vector and matrix manipulation.

---


# Exercise - Explore machine learning scenarios

- 15 minutes
Now it's your chance to train and test machine learning models.
Launch the exercise and follow the instructions.

---


# Module assessment

- 3 minutes
You want to create a model to predict the cost of heating an office building based on its size in square feet and the number of employees working there. What kind of machine learning problem is this?
Regression
Classification
Clustering
You need to evaluate a classification model. Which metric can you use? ââ
Mean squared error (MSE)
Precision
Silhouette
In deep learning, what is loss ?
Data deleted from the training set
The difference between predicted and actual label values
The financial cost of training a model
You must answer all questions before checking your work.

---


# Summary

- 1 minute
Machine learning is the foundation on which artificial intelligence is built. In this module, you've learned about some of the core principles and concepts on which machine learning is based, and about the different kinds of model you can train and evaluate.
To learn more about how machine learning can help organizations get predictive insights from their data, see What is machine learning?

---

