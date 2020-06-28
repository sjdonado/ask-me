FROM ubuntu:18.04

LABEL "MAINTAINER"=emanuel.afanador@koombea.com

ENV DEBIAN_FRONTEND noninteractive

# System packages
RUN apt-get update && apt-get install -y --no-install-recommends nginx curl
RUN apt-get -y install gcc mono-mcs gettext-base && \
    rm -rf /var/lib/apt/lists/*
RUN apt-get update

# Install miniconda to /miniconda
RUN curl -LO http://repo.continuum.io/miniconda/Miniconda3-latest-Linux-x86_64.sh
RUN bash Miniconda3-latest-Linux-x86_64.sh -p /miniconda -b
RUN rm Miniconda3-latest-Linux-x86_64.sh
ENV PATH=/miniconda/bin:${PATH}
RUN conda update -y conda
RUN apt-get update

# Python packages from conda
RUN conda install -c anaconda -y python=3.7.7
# Copy requirements.txt
COPY config/requirements.txt /opt/ml/input/config/requirements.txt
# Install requirements.txt
RUN pip install -r /opt/ml/input/config/requirements.txt
RUN pip install cython
RUN pip install gevent flask_cors fse gensim spacy
RUN python -m nltk.downloader punkt
RUN python -m nltk.downloader wordnet
RUN python -m spacy download en_core_web_sm
# Copy src
COPY flask_app /opt/ml/code

# Copy model
COPY model /opt/ml/model

# Copy nginx config
COPY config/nginx.conf /opt/ml/input/config/nginx.conf.temp

# Path
ENV PYTHONUNBUFFERED=TRUE
ENV PYTHONDONTWRITEBYTECODE=TRUE
ENV PATH="/opt/ml/code:${PATH}"

# Set work dir
WORKDIR /opt/ml/code
# ENV PORT=80

CMD serve