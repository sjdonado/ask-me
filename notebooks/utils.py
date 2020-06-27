import spacy
import re
nlp = spacy.load("en_core_web_sm")

from tqdm import tqdm
from itertools import islice
import time

# hack for tqdm
tqdm.monitor_interval = 0


class Logger:
    def __init__(self):
        self.ct = time.clock()
        self.should_log = False

    def reset_time(self):
        self.ct = time.clock()

    def log_time_s(self, label):
        self.__log_time__(label, 1)

    def log_time_ms(self, label):
        self.__log_time__(label, 1000)

    def __log_time__(self, label, multiplier):
        if self.should_log:
            print("{}: {}".format(label, multiplier * (time.clock() - self.ct)))
            self.ct = time.clock()


logger = Logger()


def tqdm_lim(iter, total=None, lim=None):
    if (total is None) and (lim is None):
        return tqdm(iter)

    right = 1000000000
    if total is not None:
        right = min(right, total)

    if lim is not None:
        right = min(right, lim)

    return tqdm(islice(iter, 0, right), total=right)

def get_regex_expression():
    """
    Generate some regex expression 
    """
    # Match non alphanumeric characters
    NON_ALPHANUMERIC_REGEX = r'[^a-zA-Z0-9À-ÿ\u00f1\u00d1\s]'
    # Match any link or url from text
    LINKS_REGEX = r'https?:\/\/.*[\r\n]'
    # Match hashtags
    HASHTAGS_REGEX = r'\#[^\s]*'
    # Match twitter accounts
    TWITTER_ACCOUNTS_REGEX = r'\@[^\s]*'
    # Match Author:
    AUTHOR_REGEX = r'author'
    # Match email 
    EMAIL_REGEX = r"\S*@\S+"
    # Group of regex
    MATCHES_GROUPED = ('({})'.format(reg) for reg in [
                                                  LINKS_REGEX, 
                                                  HASHTAGS_REGEX, 
                                                  TWITTER_ACCOUNTS_REGEX,
                                                  AUTHOR_REGEX,
                                                  EMAIL_REGEX,
                                                  NON_ALPHANUMERIC_REGEX
                                                  ])
    
    # Regex for matches group
    MATCHES_GROUPED_REGEX = r'{}'.format(('|'.join(MATCHES_GROUPED)))
    
    return MATCHES_GROUPED_REGEX

def remove_unnecesary_text(text, regex):
    """
    Remove unnecesary text using regex
    
    Args:
        text -- python string 
        regex -- python regex
    Returns:
        text -- python string
    """
    return re.sub(regex, ' ', text, flags = re.M | re.I)

# Remove all whitespace characters
def remove_whitespace(text):
    """
    Remove unnecesary whitespace
    
    Args:
        text -- python string
    Returns:
        text -- python string
    """
    return ' '.join(text.split())

def preprocess_data(text, regex, removing_stops=False, lemmatize=False):
    """
    Preprocess string data.
    Args:
        text -- A string python that is on the columns of a pandas dataframe
        regex -- Regular expression
        removing_stops -- Boolean python, if True remove english stops words
        lemmatize -- Boolean python, if True lemmatize english words
    Returns:
        text -- The Preprocess string data python
    """
    # Clean text
    text = remove_whitespace(remove_unnecesary_text(text, regex))
    
    # Tokenize the text of the blogs
    tokens = NLP(text)
    
    # Remove all punctuation marks
    tokens = [token for token in tokens if not token.is_punct]
    
    # Remove numbers or amount representation
    tokens = [token for token in tokens if not token.like_num]
    
    if removing_stops:
        # Remove stopswords
        tokens = [token for token in tokens if not token.is_stop]
        
    if lemmatize:
        # Lemmatize words
        tokens = [token.lemma_.strip().lower() for token in tokens]
    else:
        # Convert to str and lowerize
        tokens = [token.text.strip().lower() for token in tokens]
        
    tokens = [token for token in tokens if len(token)>1]
    
    return tokens