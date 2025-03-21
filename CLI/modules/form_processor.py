class FormProcessor:
    def __init__(self, form):
        self.form = form
        self.form_data = {}

    def organize_forms(self, form):
        url = form['action']
        method = form['method']
        inputs = form.find_all('input')
        content_type = form.get('enctype', 'application/x-www-form-urlencoded')
        form_data = {}
        for inp in inputs:
            name = inp.get('name')
            value = inp.get('value', '')
            type = inp.get('type', 'text')
            form_data[name] = {
                'value': value,
                'type': type
            }
        self.form_data = {
            'url': url,
            'method': method,
            'data': form_data,
            'content_type': content_type
        }

    def process(self):
        self.organize_forms(self.form)
        pass