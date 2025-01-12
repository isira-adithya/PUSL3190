from pathlib import Path
import os
import json

class Config:
    def __init__(self):
        self.config_location = None
        self.domain = ''
        self.max_depth = 2
        self.rate_limit = 5 # requests per second
        self.load(self.config_location)

    def load(self, config_file=None):
        if (config_file is None):
            # ~/.config/blind_xss_sender/config.json
            config_file = os.path.join(Path.home(), '.config', 'blind_xss_sender', 'config.json')
            self.config_location = config_file

        if not os.path.exists(config_file):
            # Create the config directory and file if they don't exist
            os.makedirs(os.path.dirname(config_file), exist_ok=True)
            with open(config_file, 'w') as f:
                json.dump(self.config, f, indent=4)
            return
        
        with open(config_file, 'r') as f:
            _tobj = json.load(f)
            self.domain = _tobj['domain']
            self.max_depth = _tobj['max_depth']
            self.rate_limit = _tobj['rate_limit']