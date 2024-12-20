from bs4 import BeautifulSoup
from modules.form_processor import FormProcessor

class HTMLParser:
    def __init__(self, url, html):
        self.html = html
        self.url = url
        self.forms = []
        self.forms_data = []                

    def find_forms(self):
        soup = BeautifulSoup(self.html, 'html.parser')
        # Find all forms in the html content
        self.forms = soup.find_all('form')
        return self.forms
    
    def find_links(self):
        soup = BeautifulSoup(self.html, 'html.parser')
        # Find all links in the html content
        links = soup.find_all('a', href=True)
        for link in links:
            # Only select links with query parameters
            if "?" in link['href']:
                print(link['href'])
        return True

    def process(self):
        # Process the html content
        forms = self.find_forms()
        for form in forms:
            form_processor = FormProcessor(form)
            form_processor.process()
            self.forms_data.append(form_processor.form_data)
        links = self.find_links()

        return self.forms_data

    