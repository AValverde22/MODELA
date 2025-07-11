import os
from flask import Flask, render_template, jsonify, request, redirect, url_for
from flask_mysqldb import MySQL
from flask_cors import CORS, cross_origin

app = Flask(__name__)
cors = CORS(app)
app.config['MYSQL_HOST'] = "127.0.0.1"
app.config['MYSQL_USER'] = "root" # CAMBIAR "root" EN CASO TENGA OTRO NOMBRE DE USUARIO
app.config['MYSQL_PASSWORD'] = "Beta2022" # CAMBIAR "Beta2022" EN CASO HAYA ESCRITO OTRA CONTRASEÑA AL CREAR MYSQL WORKBENCH
app.config['MYSQL_DATABASE'] = "Bodega"
bodega = MySQL(app)

# DICCIONARIO QUE SE EMPLEARÁ A LO LARGO DEL PROGRAMA PARA ALMACENAR LOS ID'S Y LOS DISTINTOS VALORES QUE SE NECESITEN.
Recolectado = {}

@app.route('/Mercaderia', methods=['GET'])
@cross_origin()
def mercaderiaGet():
    if request.headers.get('Content-Type') == 'application/json':
        # DE PYTHON A JAVASCRIPT, DE LA TABLA Producto SE LLAMA A LOS CAMPOS Nombre Y StockActual PARA ENVIARLOS Y ASÍ SE MUESTRE EL STOCK ACTUAL DEL PRODUCTO.
        if 'TodosLosProductosEnviados' not in Recolectado or Recolectado['ActualizarTabla'] == True:
            cur = bodega.connection.cursor()
            cur.execute('Use Bodega;')
            cur.execute('SELECT Nombre, StockActual FROM Producto ORDER BY Nombre; ')
            productos = cur.fetchall()
            productosEnviar = list()

            for producto in productos:
                JSON = {"nombreProducto": producto[0],
                        "stockActual": producto[1]}

                productosEnviar.append(JSON)

            Recolectado['TodosLosProductosEnviados'] = True
            Recolectado['ActualizarTabla'] = False
            return jsonify(productosEnviar)

        # DE PYTHON A JAVASCRIPT, SIGUE LA MISMA LÓGICA QUE EN REGISTRO DE PRODUCTO
        else:
            cur = bodega.connection.cursor()
            cur.execute('Use Bodega;')
            cur.execute("CALL devolverProductos('" + Recolectado['productoQueSeEscribe'] + "');")

            enviar = list()
            productos = cur.fetchall()
            for producto in productos:
                JSON = {"productoCompleto": producto[0]}
                enviar.append(JSON)

            return jsonify(enviar)

    Recolectado['ActualizarTabla'] = True
    return render_template('IngresoDeMercaderia.html')

@app.route('/Mercaderia', methods=['POST'])
@cross_origin()
def mercaderiaPost():
    # DE JAVASCRIPT A PYTHON, SIGUE LA MISMA LÓGICA QUE EN REGISTRO DE PRODUCTO
    if 'productoQueSeEscribe' in request.json:
        productoQueSeEscribe = request.json["productoQueSeEscribe"]
        Recolectado['productoQueSeEscribe'] = productoQueSeEscribe

        return "Producto a Medias Recibido"

    # DE JAVASCRIPT A PYTHON, SI SE RECIBIÓ MÁS MERCADERÍA ENTONCES SE EJECUTA EL PROCEDIMIENTO ingresoProducto()
    elif 'productoMercaderia' in request.json:
        cur = bodega.connection.cursor()
        cur.execute('Use Bodega;')
        cur.execute("CALL ingresoProducto('%s', %s, %s);" % (request.json['productoMercaderia'],
                                                            request.json['cantidadMercaderia'],
                                                            request.json['costoMercaderia']))

        Recolectado['ActualizarTabla'] = True
        return "Stock Actualizado"

    # DE JAVASCRIPT A PYTHON, SI SE QUIERE REGISTRAR UN NUEVO PRODUCTO A LA MERCADERÍA, ENTONCES SE LLAMA AL PROCEDIMIENTO registrarNuevoProducto()
    # CON TODOS LOS PARAMETROS CORRSPONDIENTES Y LUEGO SE ACTUALIZA LA TABLA DE PRODUCTOS.
    elif 'ProductoRegistro' in request.json:
        cur = bodega.connection.cursor()
        cur.execute('Use Bodega;')
        cur.execute("CALL registrarNuevoProducto('%s', %s, %s, %s);" % (request.json['ProductoRegistro'],
                                                                        request.json['StockRegistro'],
                                                                        request.json['PrecioUnitarioRegistro'],
                                                                        request.json['operacionRegistro']))

        Recolectado['ActualizarTabla'] = True
        return "Producto Registrado"

    return "Nada"

@app.route('/Compra', methods=['POST'])
@cross_origin()
def recibirProductosQueSeEscribe():
    # DE JAVASCRIPT A PYTHON, CADA VEZ QUE SE TIPEE EL NOMBRE DEL PRODUCTO SE ALMANCERÁ PARA LUEGO DEVOLVER LOS NOMBRES COMPLETOS QUE CONTENGAN LO ESCRITO.
    if 'productoQueSeEscribe' in request.json:
        productoQueSeEscribe = request.json["productoQueSeEscribe"]
        Recolectado['productoQueSeEscribe'] = productoQueSeEscribe

        return "Producto a Medias Recibido"

    # DE JAVASCRIPT A PYTHON, SI SE QUIERE REGISTRAR UN PRODUCTO EN DetalleBoleta
    elif 'productoNombre' in request.json:
        # SI ES LA PRIMERA VEZ, ENTONCES SE CREA EL ID_BoletaCabecera CON EL PROCEDIMIENTO primeraVezBoletaCabecera() Y LUEGO SE PROSIGUE
        if 'ID_BoletaCabecera' not in Recolectado:
            cur = bodega.connection.cursor()
            cur.execute('Use Bodega;')
            cur.execute('CALL primeraVezBoletaCabecera();')
            Recolectado['ID_BoletaCabecera'] = cur.fetchall()[0][0]

        # SE RECIBE EL NOMBRE COMPLETO Y LA CANTIDAD QUE SE DESEA Y COMO YA SE TIENE EL ID_BoletaCabecera ENTONCES SE LLAMA AL PROCEDIMIENTO RegistrarProducto()
        # QUE SE ENCARGA DE INSERTARLO EN DetalleBoleta
        productoNombre = request.json['productoNombre']
        productoCantidad = request.json['productoCantidad']

        cur = bodega.connection.cursor()
        cur.execute('Use Bodega;')
        cur.execute("CALL RegistrarProducto(" + str(productoCantidad) + ", " + str(Recolectado['ID_BoletaCabecera']) + ", '" + productoNombre + "');")

        return "Producto Registrado"

    # DE JAVASCRIPT A PYTHON, SI SE DESEA ELIMINAR UN PRODUCTO QUE SE REGISTRO, ENTONCES CON EL PROCEDIMIENTO eliminarProducto() SE ELIMINA EL PRODUCTO
    # CON EL ID_Producto RECIBIDO.
    elif 'eliminar' in request.json:
        cur = bodega.connection.cursor()
        cur.execute('Use Bodega;')

        cur.execute('CALL eliminarProducto(%s, %s)' % (request.json["eliminar"],
                                                       Recolectado['ID_BoletaCabecera']))

        return "Producto Eliminado"

    # DE JAVASCRIPT A PYTHON, CUANDO YA SE TENGA QUE PAGAR POR TODO LO REGISTRADO, SE ACTUALIZARA LA FILA DE BoletaCabecera QUE SE ENCUENTRA ALMACENADA EN EL SISTEMA
    # TAMBIÉN SE EXTRAEN LOS ID'S GUARDADOS EN EL DICCIONARIO DE PYTHON. LUEGO SE EJECUTAN LAS FUNCIONES calcularSubTotalOPInafecta() Y calcularSubTotalOPGravada()
    # PARA CALCULAR LOS SUBTOTALES. UNA VEZ CON ESTOS DATOS, SE LLAMA AL PROCEDIMIENTO segundaVezBoletaCabecera() PARA PODER HACER UN UPDATE CON TODOS LOS VALORES.
    elif 'Cancelo' in request.json:
        cur = bodega.connection.cursor()
        cur.execute('Use Bodega;')

        ID_BoletaCabecera = Recolectado['ID_BoletaCabecera']
        ID_Cliente = Recolectado['ID_Cliente']
        ID_Cajero = Recolectado['ID_Cajero']
        ID_TipoPago = request.json['MetodoPago']
        ID_Cancelo = request.json['Cancelo']

        cur.execute('SELECT calcularSubTotalOPInafecta(%s);' % ID_BoletaCabecera)
        TotalOPInafecta = cur.fetchall()[0][0]
        if TotalOPInafecta is None: TotalOPInafecta = 0

        cur.execute('SELECT calcularSubTotalOPGravada(%s);' % ID_BoletaCabecera)
        TotalOPGravada = cur.fetchall()[0][0]
        if TotalOPGravada is None: TotalOPGravada = 0

        if ID_Cancelo == 0:
            cur.execute('CALL segundaVezBoletaCabecera(%s, %s, %s, %s, %s, %s, NULL)' % (ID_BoletaCabecera,
                                                                                       TotalOPInafecta,
                                                                                       TotalOPGravada,
                                                                                       ID_Cliente,
                                                                                       ID_Cajero,
                                                                                       ID_TipoPago))

        else:
            cur.execute('CALL segundaVezBoletaCabecera(%s, %s, %s, %s, %s, %s, %s)' % (ID_BoletaCabecera,
                                                                                       TotalOPInafecta,
                                                                                       TotalOPGravada,
                                                                                       ID_Cliente,
                                                                                       ID_Cajero,
                                                                                       ID_TipoPago,
                                                                                       ID_Cancelo))

        return "Compra Terminada con Exito"

    # DE JAVASCRIPT A PYTHON, SI EL CAJERO TIENE QUE CANCELAR TODA LA COMPRA Y POR LO MENOS SE REGISTRO UN PRODUCTO ALGUNA VEZ, ENTONCES CON
    # EL PROCEDIMIENTO eliminarBoletaCabecera() SE ELIMINARÁ TODO LO REGISTRADO PARA ESA COMPRA.
    elif 'eliminarTodo' in request.json:
        if 'ID_BoletaCabecera' in Recolectado:
            cur = bodega.connection.cursor()
            cur.execute('Use Bodega;')
            cur.execute('CALL eliminarBoletaCabecera(%s);' % Recolectado['ID_BoletaCabecera'])
            Recolectado.pop('ID_BoletaCabecera')

            return "Todo fue eliminado"

        # EN CASO NO SE HAYA REGISTRADO NINGÚN PRODUCTO NUNCA, SOLO SE REGRESRRÁ A LA VENTANA DE SELECCIONAR CLIENTE.
        return "Nada fue eliminado porque no se registro ningun producto."

    return "."

@app.route('/Compra', methods=['GET'])
@cross_origin()
def enviarTodosLosProductos():
    if request.headers.get('Content-Type') == 'application/json':
        # DE PYTHON A JAVASCRIPT SE ENVIARA EL ID_FrecuenciaPago PARA QUE CUANDO EL CLIENTE DECIDA PAGAR YA, APAREZCA LA OPCIÓN DE FIADO.
        if 'productoQueSeEscribe' not in Recolectado:
            return jsonify({'ID_FP': Recolectado['ID_FP']})

        # DE PYTHON A JAVASCRIPT, CADA VEZ QUE SE REGISTRE O ELIMINE UN PRODUCTO, TIENE QUE ACTUALIZARSE LA TABLA DE PRODUCTOS Y LA DE PAGOS. ENTONCES,
        # SE CON LAS FUNCIONES calcularSubTotalOPInafecta() y calcularSubTotalOPGravada() SE CALCULARÁN LOS SUBTOTALES QUE SE TIENEN HASTA EL MOMENTO,
        # TAMBIÉN DESDE PYTHON SE CALCULARÁ EL IGV Y EL TOTAL A PAGAR.
        else:
            cur = bodega.connection.cursor()
            cur.execute('Use Bodega;')

            # POR ALGUNA RAZON HAY QUE INCLUIR ESTO PARA QUE LA SUMA DE PRECIOS SALGA BIEN LUEGO DE HABER ELIMINADO UN PRODUCTO
            if 'ID_BoletaCabecera' in Recolectado:
                cur.execute('SELECT * FROM DETALLEBOLETA WHERE ID_BOLETACABECERA = %s' % Recolectado['ID_BoletaCabecera'])

            cur.execute("CALL devolverProductos('" + Recolectado['productoQueSeEscribe'] + "');")

            enviar = list()
            productos = cur.fetchall()
            for producto in productos:
                # ESTA ES UNA EXCEPCIÓN, CUANDO EL CLIENTE AÚN NO TIENE NINGÚN PRODUCTO SELECCIONADO ENTONCES, NO SE PUEDE CALCULAR LOS SUBTOTALES POR LO QUE SE ENVIARÁ CON CERO
                # LUEGO, DE HABER REGISTRADO EL PRIMER PRODUCTO SI SE PODRÁ, YA QUE SE NECESITA EL ID_BoletaCabecera PARA PODER EJECUTARLOS.
                if 'ID_BoletaCabecera' not in Recolectado:
                    productoDict = {"productoCompleto": producto[0],
                                    "precioUnitario": round(float(producto[1]), 2),
                                    "ID_Producto": producto[2],
                                    "SubTotalOPInafecta": 0,
                                    "SubTotalOPGravada": 0,
                                    "IGV": 0,
                                    "TotalPagar": 0,
                                    "StockProducto": producto[3]}

                else:
                    cur.execute("SELECT calcularSubTotalOPInafecta(" + str(Recolectado['ID_BoletaCabecera']) + ");")
                    stopi = cur.fetchall()[0][0]
                    if stopi is None: stopi = 0
                    else: stopi = round(float(stopi), 2)
                    Recolectado['SubTotalOPInafecta'] = stopi

                    cur.execute("SELECT calcularSubTotalOPGravada(" + str(Recolectado['ID_BoletaCabecera']) + ");")
                    stopg = cur.fetchall()[0][0]
                    if stopg is None: stopg = 0
                    else: stopg = round(float(stopg), 2)
                    Recolectado['SubTotalOPGravada'] = stopg

                    igv = round(stopg * 0.18, 2)
                    Recolectado['IGV'] = igv

                    total = round(stopi + stopg + igv, 2)
                    Recolectado['TotalPagar'] = total

                    productoDict = {"productoCompleto": producto[0],
                                    "precioUnitario": producto[1],
                                    "ID_Producto": producto[2],
                                    "SubTotalOPInafecta": Recolectado["SubTotalOPInafecta"],
                                    "SubTotalOPGravada": Recolectado["SubTotalOPGravada"],
                                    "IGV": Recolectado['IGV'],
                                    "TotalPagar": Recolectado['TotalPagar'],
                                    "StockProducto": producto[3]}

                enviar.append(productoDict)

            return jsonify(enviar)

    # ESTO SERÁ LO PRIMERO QUE SE EJECUTE EN CUANDO SE HAYA PRESIONADO EL BOTÓN DE CONTINUAR EN LA PARTE DE SELECCIONAR CLIENTE
    # SE ENVIARÁ ADICIONALMENTE EL NOMBRE COMPLETO DEL CLIENTE.
    if "ID_Cliente" in Recolectado:
        return render_template("RegistroDeProductos.html", nombreCompleto = Recolectado['nombreCompleto'])

    return "Cliente No Encontrado"


@app.route('/Cliente', methods=['POST'])
@cross_origin()
def recibirClienteQueSeEscribe():
    # DE JAVASCRIPT A PYTHON, SE RECIBE Y ALMACENA EL NOMBRE ESCRITO A MEDIAS PARA LUEGO ENCONTRAR TODAS LAS COINCIDENCIAS QUE EXISTAN EN LA TABLA CLIENTE,
    if 'nombreQueSeEscribe' in request.json:
        Recolectado.pop('ID_Cliente', None)

        nombreQueSeEscribe = request.json["nombreQueSeEscribe"]
        Recolectado['nombreQueSeEscribe'] = nombreQueSeEscribe

        return "Nombre a Medias Recibido"

    # DE JAVASCRIPT A PYTHON, LUEGO DE HABER ESCRITO EL NOMBRE COMPLETO, SE TIENE QUE VALIDAR SI ES QUE PRESENTA DEUDA ALGUNA, ENTONCES PRIMERO
    # CON EL PROCEDIMIENTO retornaIDCliente() RECOLECTA SU ID_Cliente Y TAMBIÉN SU FrecuenciaPago PARA QUE LUEGO EN LA SIGUIENTE PESTAÑA APAREZCA
    # LA OPCIÓN DE PAGAR POR FIADO O NO.
    elif 'nombreCompleto' in request.json:
        nombreCompleto = request.json["nombreCompleto"]
        Recolectado['nombreCompleto'] = nombreCompleto

        cur = bodega.connection.cursor()
        cur.execute('Use Bodega;')
        cur.execute("CALL retornaIDCliente('" + nombreCompleto + "');")

        ids = cur.fetchall()[0]
        idCliente = ids[0]
        idFP = ids[1]
        Recolectado['ID_Cliente'] = idCliente
        Recolectado['ID_FP'] = idFP

        if idCliente is not None:
            return "Cliente Existente"

        return "Nombre Incorrecto"

    # DE JAVASCRIPT A PYTHON, SE QUIERE REGISTRAR UN NUEVO CLIENTE ENTONCES SE REGISRA CON EL PROCEDIMIENTO registrarCliente()
    elif 'DNICliente' in request.json:
        cur = bodega.connection.cursor()
        cur.execute('Use Bodega;')
        cur.execute("CALL registrarCliente('%s', '%s', '%s', '%s', %s, '%s', %s);" % (request.json["DNICliente"],
                                                                                      request.json["NombreCliente"],
                                                                                      request.json["PrimerApellidoCliente"],
                                                                                      request.json["SegundoApellidoCliente"],
                                                                                      request.json["TelefonoCliente"],
                                                                                      request.json["DireccionCliente"],
                                                                                      request.json["FrecuenciaPago"]))

        return "Cliente Registrado"

    # DE JAVASCRIPT A PYTHON, COMO EL CLIENTE TIENE QUE PAGAR SUS DEUDAS ANTES DE PODER REALIZAR UNA NUEVA COMPRA, SE RECIBIRA EL ID_BoletaCabecera UNO POR UNO
    # PARA PODER SOLVENTAR SU DEUDA QUE LUEGO SERÁ EMPLEADO EN EL PROCEDIMIENTO pagarDeuda().
    elif 'ID_BoletaCabeceraPagar' in request.json:
        cur = bodega.connection.cursor()
        cur.execute('Use Bodega;')
        cur.execute('CALL pagarDeuda(%s);' % request.json['ID_BoletaCabeceraPagar'])

        return "Deuda Cancelada"

    return "Nada Recibido Aún"

@app.route('/Cliente', methods=['GET'])
@cross_origin()
def enviarTodosLosClientes():
    if request.headers.get('Content-Type') == 'application/json':
        # DE PYTHON A JAVASCRIPT, SI SE PRESIONÓ EL BOTÓN DE HISTORIAL LUEGO HABER ESCRITO EL NOMBRE COMPLETO DEL CLIENTE, SE ENVIARÁ TODO SU HISTORIAL DE PAGOS
        # PARA LUEGO VALIDAR SI ES QUE TIENE ALGUNA DEUDA PENDIENTE O NO. ESTO SE REALIZA CON EL PROCEDIMIENTO retornarPagos().
        if 'ID_Cliente' in Recolectado:
            cur = bodega.connection.cursor()
            cur.execute('Use Bodega;')
            cur.execute('CALL retornarPagos(%s);' % Recolectado['ID_Cliente'])

            enviar = list()
            pagos = cur.fetchall()
            for pago in pagos:
                # TAMBIÉN SE ENVIA LA DESCRIPCIÓN DE LA FRECUENCIA DE PAGO PARA PONERLO COMO REFERENCIA Y ASÍ EL CAJERO SEPR CADA CUANTO TIEMPO TIENE QUE PAGAR.
                cur.execute('SELECT DescFP FROM FrecuenciaPago f JOIN Cliente c ON c.ID_FP = f.ID_FP WHERE ID_CLIENTE = %s;' % Recolectado['ID_Cliente'])
                pagosDict = {"ID_BoletaCabecera": pago[0],
                             "Fecha": pago[1],
                             "Total": pago[2],
                             "Deuda": pago[3],
                             "ID_FP": cur.fetchall()[0][0]}
                enviar.append(pagosDict)

            return jsonify(enviar)

        # DE PYTHON A JAVASCRIPT, SE ENVIAN TODOS LOS NOMBRES QUE CONTIENEN LA LETRA O PALABRA ESCRITA POR EL CAJERO PARA BUSCAR AL CLIENTE,
        # ESTO SE REALIZA CON EL PROCEDIMIENTO devolverClientes().
        cur = bodega.connection.cursor()
        cur.execute('Use Bodega;')
        cur.execute("CALL devolverClientes('" + Recolectado['nombreQueSeEscribe'] + "');")

        enviar = list()
        clientes = cur.fetchall()
        for cliente in clientes:
            nombreDict = {"nombreCompleto": cliente[0]}
            enviar.append(nombreDict)

        return jsonify(enviar)

    # ESTO SERÁ LO PRIMERO QUE SE EJECUTE LUEGO DE HABER INICIADO SESIÓN. SE MOSTRARÁ LA PANTALLA DE SELECCIONAR CLIENTE.
    # DE PYTHON A JAVASCRIPT, SE ENVIARÁ EL NOMBRE COMPLETO DEL CAJERO ASÍ COMO SU ID_CAJERO PARA VALIDAR SI EL BOTÓN DE REGISTRAR MERCADERÍA SE EJECUTE O NO.
    if "ID_Cajero" in Recolectado:
        cur = bodega.connection.cursor()
        cur.execute('Use Bodega;')
        cur.execute("SELECT CONCAT(Nombre, ' ', Apellido) FROM Cajero WHERE ID_Cajero = %s" % Recolectado['ID_Cajero'])

        return render_template('SeleccionarCliente.html', ID_Cajero = Recolectado['ID_Cajero'], NombreCajero = cur.fetchall()[0][0])

    else:
        return "Cajero NO encontrado"

@app.route('/', methods=['POST'])
@cross_origin()
def Cajero():
    # DE JAVASCRIPT A PYTHON, SE RECIBIRÁ EL USUARIO Y CONTRASEÑA ESCRITA EN PANTALLA PARA EJECUTAR LA FUNCIÓN retornaIDCajero();
    # EN CASO EXISTA DEVOLVERÁ ALMACENARÁ EL ID_CAJERO CORRESPONDIENTE,
    # EN CASO NO EXISTA, SE GUARDARÁ EL ID_CAJERO CON EL VALOR DE CERO, PARA QUE JAVASCRIPT PUEDA EVALUAR SI PROCEDE O NO.
    if 'Usuario' in request.json:
        cur = bodega.connection.cursor()
        cur.execute('Use Bodega;')
        cur.execute("SELECT retornaIDCajero('" +
                    request.json["Usuario"] + "', '" + request.json["Contrasena"] + "');")

        idCajero = cur.fetchall()[0][0]
        Recolectado['ID_Cajero'] = idCajero

        return "Cajero Recibido"

    # DE JAVASCRIPT A PYTHON, SI SE DESEA REGISTRAR UN NUEVO CAJERO, SE RECIBIRÁN TODOS LOS DATOS Y EJECUTRÁ EL PROCEDIMIENTO registrarCajero().
    if 'NombreCajero' in request.json:
        cur = bodega.connection.cursor()
        cur.execute('Use Bodega;')
        cur.execute("CALL registrarCajero('%s', '%s', '%s', '%s', '%s');" % (request.json["NombreCajero"],
                                                                            request.json["ApellidoCajero"],
                                                                            request.json["DNICajero"],
                                                                            request.json["UsuarioRegistrarCajero"],
                                                                            request.json["ContrasenaRegistrarCajero"]))

        return "Cajero Registrado"

    return "Nada recibido"

@app.route('/', methods=['GET'])
@cross_origin()
def index():
    # DE PYTHON A JAVASCRIPT, SE ENVIARÁ EL ID_CAJERO RECIBIDO DE LA FUNCIÓN retornaIDCajero().
    if request.headers.get('Content-Type') == 'application/json':
        return jsonify({'idCajeroRecibido': Recolectado['ID_Cajero']})

    # ESTO ES LO PRIMERO QUE SE EJECUTA AL INICIAR EL PROGRAMA, ES LA VENTANA PRINCIPAL EN DONDE SE REALIZA EL INICIO DE SESIÓN.
    return render_template('IniciarSesion.html')

if __name__ == '__main__':
    app.run(None, 3000, True)
