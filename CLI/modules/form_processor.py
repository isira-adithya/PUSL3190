class FormProcessor:
    def __init__(self, form):
        self.form = form
        self.form_data = {}

    def organize_forms(self, form):
        url = form['action']
        method = form['method']
        inputs = form.find_all('input')
        form_data = {}
        for inp in inputs:
            name = inp.get('name')
            value = inp.get('value', '')
            form_data[name] = value
        self.form_data = {
            'url': url,
            'method': method,
            'data': form_data
        }

    def process(self):
        self.organize_forms(self.form)
        pass