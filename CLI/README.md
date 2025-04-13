# Installation Guide

## Prerequisites

- Python 3.7 or higher
- pipx (recommended for CLI tool installation)

If you don't have pipx installed, you can install it using pip:

```bash
pip install pipx
pipx ensurepath
```

## Installation Options

### Install using pipx (Recommended)

[pipx](https://pypa.github.io/pipx/) is the recommended way to install CLI tools as it creates isolated environments for Python applications.

```bash
pipx install "git+https://github.com/isira-adithya/PUSL3190.git@main#subdirectory=CLI"
```

## Verifying Installation

After installation, verify that xsspecter is correctly installed:

```bash
xsspecter --version
```

## Uninstallation

To remove xsspecter:

```bash
pipx uninstall xsspecter
```
