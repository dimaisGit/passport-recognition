import cv2
import sys
import pytesseract
import np

if __name__ == '__main__':

  def get_grayscale(image):
      return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

  # noise removal
  def remove_noise(image):
      return cv2.medianBlur(image,5)

  #thresholding
  def thresholding(image):
      return cv2.threshold(image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]

  #dilation
  def dilate(image):
      kernel = np.ones((5,5),np.uint8)
      return cv2.dilate(image, kernel, iterations = 1)

  #erosion
  def erode(image):
      kernel = np.ones((5,5),np.uint8)
      return cv2.erode(image, kernel, iterations = 1)

  #opening - erosion followed by dilation
  def opening(image):
      kernel = np.ones((5,5),np.uint8)
      return cv2.morphologyEx(image, cv2.MORPH_OPEN, kernel)

  #canny edge detection
  def canny(image):
      return cv2.Canny(image, 100, 200)

  #skew correction
  def deskew(image):
      coords = np.column_stack(np.where(image > 0))
      angle = cv2.minAreaRect(coords)[-1]
      if angle < -45:
          angle = -(90 + angle)
      else:
          angle = -angle
      (h, w) = image.shape[:2]
      center = (w // 2, h // 2)
      M = cv2.getRotationMatrix2D(center, angle, 1.0)
      rotated = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
      return rotated

  #template matching
  def match_template(image, template):
      return cv2.matchTemplate(image, template, cv2.TM_CCOEFF_NORMED)

  if len(sys.argv) < 2:
    print('Usage: python ocr_simple.py image.jpg')
    sys.stdout.flush()
    sys.exit(1)

  # Read image path from command line
  imPath = sys.argv[1]

  # Uncomment the line below to provide path to tesseract manually
  # pytesseract.pytesseract.tesseract_cmd = '/usr/bin/tesseract'

  # Define config parameters.
  # '-l eng'  for using the English language
  # '--oem 1' for using LSTM OCR Engine
  config = ('-l rus --oem 1 --psm 3')

  # Read image from disk
  im = cv2.imread(imPath)
#   gray = get_grayscale(im)
#   thresh = thresholding(gray)
#   opening = opening(gray)
#   canny = canny(gray)
#   less_noise = remove_noise(gray)


  # Run tesseract OCR on image
  text = pytesseract.image_to_string(im, config=config)

  # Print recognized text
  print(text)
  sys.stdout.flush()
