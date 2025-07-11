# Proyecto MODELA

1. Clona el repositorio:
   - `git clone https://github.com/AValverde22/MODELA.git`

2. Para este caso, abrir MySQL Configurator
   - En la pantalla de "Type and Networking" solo presionar el botón de "Next".
   - En la pantalla de "Accounts and Roles" escribir la contraseña que usted creo al momento de instalar el programa y presionar el botón de "Check".

3. Ahora, dirigirse a MySQL Workbench CE
   - Crar una nueva conexión si lo ve necesario.
   - En el panel de "Administration", seleccionar la opción de "Data Import/Restore" y seleccionar el archivo Bodega.sql
   - Para comprobar que la base de datos se haya cargado correctamente, ejecutar el comando `USE Bodega;` y `SELECT * FROM Cajero;`.

4. Crear un archivo `.env` en la raíz con este contenido:
   - `DB_USER=root`
   - `DB_PASSWORD=Beta2022 <-cambiarlo por la contraseña que empleas en MySQL Configurator`
   - `DB_NAME=Bodega`
   
5. Una vez activo MYSQL, abrir PyCharm
   - Seleccionar la opción de abrir proyecto y seleccionar la carpeta `\MODELA`.
   - Se cargaran todos los archivos.
   - Ejecutar el script de `backend.py`
   - En la terminal, abrir el enlace.

- En Bodega.zip, se encuentran todos las sentencias SQL
