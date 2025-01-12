from modules.config import Config

class PayloadGenerator:
    def __init__(self):
        self.config = Config().config
        self.payloads = []
        self.generate_payloads()

    def generate_payloads(self):
        if (self.config['domain'] == ''):
            print(f"Please set the domain in the config file. ({Config().config_location})")
            exit()

    def get_payloads(self):
        return self.payloads