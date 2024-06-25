FROM python:3.11

# Set the working directory
WORKDIR /build

# Copy the current directory contents into the container at /build
COPY . ./

# Install the required dependencies
RUN pip install -r requirements.txt

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Run app.py when the container launches
CMD python app.py
