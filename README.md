# Proyecto MODELA

1. Clona el repositorio:
   - `git clone https://github.com/AValverde22/MODELA.git`

2. Para este caso, abrir MySQL Configurator o simplemente activar el servicio `MySQL80`
   - En la pantalla de "Type and Networking" solo presionar el botón de "Next".
   - En la pantalla de "Accounts and Roles" escribir la contraseña que usted creo al momento de instalar el programa y presionar el botón de "Check".

3. Ahora, dirigirse a MySQL Workbench CE
   - Crar una nueva conexión si lo ve necesario.
   - En el panel de "Administration", seleccionar la opción de "Data Import/Restore" y seleccionar el archivo Bodega.sql
   - Para comprobar que la base de datos se haya cargado correctamente, ejecutar el comando `USE Bodega;` y `SELECT * FROM Cajero;`.
   
4. Una vez activo MYSQL, abrir PyCharm
   - Seleccionar la opción de abrir proyecto y seleccionar la carpeta `\MODELA`.
   - Se cargaran todos los archivos.
   - Cambiar el usuario y contraseña de la las líneas 8 y 9 a sus credenciales que use para MySQL.
   - Ejecutar el script de `backend.py`
   - En la terminal, abrir el enlace.

- En `Bodega.zip`, se encuentran todos las sentencias SQL
