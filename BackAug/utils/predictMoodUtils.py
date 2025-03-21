import numpy as np
import pickle
import os
import re
from nltk.corpus import stopwords
from tensorflow.keras.preprocessing.sequence import pad_sequences

# Load the model and vectorizer
current_dir = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(current_dir, '../pickles', 'model.pkl')
VECTORIZER_PATH = os.path.join(current_dir, '../pickles', 'vectorizer.pkl')
TOKENIZER_PATH = os.path.join(current_dir, '../pickles', 'tokenizer.pkl')
max_len = 200

with open(MODEL_PATH, 'rb') as file:
    model = pickle.load(file)

with open(VECTORIZER_PATH, 'rb') as file:
    vectorizer = pickle.load(file) 

with open(TOKENIZER_PATH, 'rb') as file:
    tokenizer = pickle.load(file)

# Prediction function
import json

def predict_emotion_util(text):
    try:
        text_seq = tokenizer.texts_to_sequences([text])
        text_pad = pad_sequences(text_seq, maxlen=max_len)
        probs = model.predict(text_pad)[0]  # Extract the first (and only) prediction

        class_labels = ["sad", "happy", "love", "angry", "scared"]
        class_probs = {class_labels[i]: round(float(probs[i]) * 100, 2) for i in range(len(class_labels))}

        predicted_class = class_labels[np.argmax(probs)]

        result = {
            "mood": predicted_class,
            "probabilities": class_probs
        }

        json_result = json.dumps(result, indent=4)
        print(json_result)
        
        return json_result
    except Exception as e:
        print(f"Error during prediction: {e}")
        return json.dumps({"error": str(e)})
































# Sample data
arr = [
    "i didnt feel humiliated",
    "i can go from feeling so hopeless to so damned hopeful just from being around someone who cares and is awake",
    "im grabbing a minute to post i feel greedy wrong",
    "i am ever feeling nostalgic about the fireplace i will know that it is still on the property",
    "i am feeling grouchy",
    "ive been feeling a little burdened lately wasnt sure why that was",
    "ive been taking or milligrams or times recommended amount and ive fallen asleep a lot faster but i also feel like so funny",
    "i feel as confused about life as a teenager or as jaded as a year old man",
    "i have been with petronas for years i feel that petronas has performed well and made a huge profit",
    "i feel romantic too",
    "i feel like i have to make the suffering i m seeing mean something",
    "i do feel that running is a divine experience and that i can expect to have some type of spiritual encounter",
    "i think it s the easiest time of year to feel dissatisfied",
    "i feel low energy i m just thirsty",
    "i have immense sympathy with the general point but as a possible proto writer trying to find time to write in the corners of life and with no sign of an agent let alone a publishing contract this feels a little precious",
    "i do not feel reassured anxiety is on each side",
    "i didnt really feel that embarrassed",
    "i feel pretty pathetic most of the time",
    "i started feeling sentimental about dolls i had as a child and so began a collection of vintage barbie dolls from the sixties",
    "i now feel compromised and skeptical of the value of every unit of work i put in",
    "i feel irritated and rejected without anyone doing anything or saying anything",
    "i am feeling completely overwhelmed i have two strategies that help me to feel grounded pour my heart out in my journal in the form of a letter to god and then end with a list of five things i am most grateful for",
    "i have the feeling she was amused and delighted",
    "i was able to help chai lifeline with your support and encouragement is a great feeling and i am so glad you were able to help me",
    "i already feel like i fucked up though because i dont usually eat at all in the morning",
    "i still love my so and wish the best for him i can no longer tolerate the effect that bm has on our lives and the fact that is has turned my so into a bitter angry person who is not always particularly kind",
    "i feel so inhibited in someone elses kitchen like im painting on someone elses picture",
    "i become overwhelmed and feel defeated",
    "i feel kinda appalled that she feels like she needs to explain in wide and lenghth her body measures etc pp",
    "i feel more superior dead chicken or grieving child",
    "i get giddy over feeling elegant in a perfectly fitted pencil skirt",
    "i remember feeling acutely distressed for a few days",
    "i have seen heard and read over the past couple of days i am left feeling impressed by more than a few companies",
    "i climbed the hill feeling frustrated that id pretty much paced entirely wrong for this course and that a factor that has never ever hampered me had made such a dent in the day",
    "i can t imagine a real life scenario where i would be emotionally connected enough with someone to feel totally accepted and safe where it it morally acceptable for me to have close and prolonged physical contact and where sex won t be expected subsequently",
    "i am not sure what would make me feel content if anything",
    "i have been feeling the need to be creative",
    "i do however want you to know that if something someone is causing you to feel less then your splendid self step away from them",
    "i feel a bit rude writing to an elderly gentleman to ask for gifts because i feel a bit greedy but what is christmas about if not mild greed",
    "i need you i need someone i need to be protected and feel safe i am small now i find myself in a season of no words",
    "i plan to share my everyday life stories traveling adventures inspirations and handmade creations with you and hope you will also feel inspired",
    "i already have my christmas trees up i got two and am feeling festive which i m sure is spurring me to get started on this book",
    "ive worn it once on its own with a little concealer and for the days im feeling brave but dont want to be pale then its perfect",
    "i feel very strongly passionate about when some jerk off decides to poke and make fun of us",
    "i was feeling so discouraged we are already robbing peter to pay paul to get our cow this year but we cant afford to not get the cow this way",
    "i was feeling listless from the need of new things something different",
    "i lost my special mind but don t worry i m still sane i just wanted you to feel what i felt while reading this book i don t know how many times it was said that sam was special but i can guarantee you it was many more times than what i used in that paragraph did i tell you she was special",
    "i can t let go of that sad feeling that i want to be accepted here in this first home of mine",
    "on a boat trip to denmark"
]

# Predict and print results
# for text in arr:
    # text_seq = tokenizer.texts_to_sequences([text])
    # text_pad = pad_sequences(text_seq, maxlen=max_len)
    # predicted_class = np.argmax(model.predict(text_pad), axis=1)
    # print(predicted_class)

text = "Hello I very excited today, how about you!"  
predict_emotion_util(text)

