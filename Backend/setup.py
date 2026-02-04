from setuptools import find_packages, setup

try:
    with open("README.md", "r", encoding="utf-8") as fh:
        long_description = fh.read()
except FileNotFoundError:
    long_description = "AI-Powered Call Summarization using RAG"

with open("requirements.txt", "r", encoding="utf-8") as fh:
    requirements = [line.strip() for line in fh if line.strip() and not line.startswith("#")]

setup(
    name="convoxai",
    version="0.1.0",
    author="Dhruv Agarwal,Ayush Sharma",
    author_email="dhruv610agg@gmail.com,ayushsharma130408@gmail.com",
    description="AI-Powered Call Summarization using RAG - ConvoxAi",
    long_description=long_description,
    long_description_content_type="text/markdown",
    packages=find_packages(),
    install_requires=requirements,
    python_requires=">=3.10,<3.12",
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
)

