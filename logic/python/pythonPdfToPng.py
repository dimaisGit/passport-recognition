import sys
import os
from PIL import Image
from pdf2image import convert_from_path
import random
import string
import pathlib
import json
import cv2
import np

def get_grayscale(image):
    return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

def remove_noise(image):
    return cv2.medianBlur(image, 1)

def adaptiveThreshold(image):
    return cv2.adaptiveThreshold(image, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 67, 30)

def otsuThreshold(image):
    return cv2.threshold(image, 127, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]

def canny(image):
    return cv2.Canny(image, 100, 200)

def randomString(stringLength=10):
    """Generate a random string of fixed length """
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(stringLength))

if len(sys.argv) < 2: #if there is no pdf path
    print('U didnt pass pdf path')
    sys.stdout.flush()
    sys.exit(1)

  # Read image path from command line
pdfPath = sys.argv[1]

images = convert_from_path(pdfPath) #get images

# image = images[0].convert('RGB')
# image.save('1.png')
# image = cv2.imread('1.png', 0)
# gray = get_grayscale(image)
# thresh = adaptiveThreshold(image)
# cv2.imshow('image', thresh)
# cv2.waitKey(0)


directoryName = randomString(15)
while os.path.isdir(directoryName):
    directoryName = randomString(15) #while directory exists
os.mkdir(directoryName) # create directory

allImages = []

absolutePath = str(pathlib.Path().absolute())

for now in range(0, len(images)):
    fileName = str(now) + '.png'
    convertedImagePath = directoryName + '/' + fileName
    image = images[now].convert('RGB') #convert to PIL format
    image = np.array(image)
    gray = get_grayscale(image)
    thresh = adaptiveThreshold(gray)
#     otsu_thresh = otsuThreshold(gray)
    less_noise = remove_noise(thresh)
    canny_image = canny(less_noise)
    cv2.imwrite(convertedImagePath, image)
    allImages.append(absolutePath + '/' + convertedImagePath)

print(allImages, end = '')
sys.stdout.flush()