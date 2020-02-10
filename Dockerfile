#mkdir
FROM node:10
WORKDIR /usr/src/app

#python install
RUN apt update &&\
  apt install -y python3

#python dependencies install
RUN apt install -y tesseract-ocr\
  libtesseract-dev\
  python3-pip\
  poppler-utils\
 && pip3 install opencv-python-headless\
 && pip3 install Pillow\
 && pip3 install pdf2image\
 && pip3 install np

#google dependencies
RUN apt install -y apt-transport-https\
  ca-certificates\
  gnupg &&\
  echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list &&\
  curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key --keyring /usr/share/keyrings/cloud.google.gpg add - &&\
  apt update &&\
  apt install -y google-cloud-sdk

#nodejs
COPY package.json /usr/src/app
RUN npm install

#google credentials

COPY . /usr/src/app
COPY TextRecognition-28bfdad2da71.json /usr/src/app
RUN export GOOGLE_APPLICATION_CREDENTIALS="/usr/src/app/TextRecognition-28bfdad2da71.json"
CMD ["./node_modules/.bin/nodemon", "-L", "index.js"]
