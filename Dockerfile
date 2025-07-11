# Imagen base de Python
FROM python:3.10

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiar dependencias
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copiar el resto del proyecto
COPY . .

# Exponer el puerto de Flask
EXPOSE 5000

# Comando para arrancar Flask
CMD ["python", "Backend.py"]
