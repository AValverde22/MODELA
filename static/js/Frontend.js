const URL = 'http://127.0.0.1:3000/'

// FUNCIONES PARA IngresoDeMercaderia.html

// SI SE PRESIONA EL BOTÓN REGRESAR, UNO VUELVE A LA PESTAÑA DE SELECCIONAR CLIENTE
function regresarASeleccionarCliente(){window.location.href= "http://127.0.0.1:3000/Cliente";}

// DE PYTHON A JAVASCRIPT, SE ACTUALIZA LA TABLA DE PRODUCTOS Y STOCK
async function recibirTodosLosProductosMercaderia(){
    var url = URL + "/Mercaderia"
    var productosRecibidos = await fetch(url, {
        "method": 'GET',
        "headers": {
            "Content-Type": 'application/json'
        }
    })

    var Productos = await productosRecibidos.json();

    var tablaProductos = document.getElementById("StockProductos");
    var HTML = `<tr>
                    <th>Producto</th>
                    <th>Stock Actual</th>
                </tr>`;
    tablaProductos.innerHTML = HTML;

    HTML = "";
    for(var i = 0; i < Productos.length; i++){
        var nombreProducto = Productos[i]['nombreProducto'];
        var stockActual = Productos[i]['stockActual'];

        HTML += `
            <tr>
                <td>${nombreProducto}</td>
                <td>${stockActual}</td>
            </tr>
        `
    }

    tablaProductos.innerHTML += HTML;
}

// DE JAVASCRIPT A PYTHON, SE SIGUE LA MISMA LÓGICA QUE PARA EL CLIENTE Y PRODUCTO
async function recibirProductoQueSeEscribeMercaderia(){
    var escrito = {"productoQueSeEscribe": document.getElementById("productoInput").value};

    var url = URL + "/Mercaderia";
    await fetch(url, {
    "method": 'POST',
    "body": JSON.stringify(escrito),
    "headers": {
        "Content-Type": 'application/json'
        }
    });

    enviarTodosLosProductosMercaderia().then(result => {
        var listaProductos = result;

        if(listaProductos.includes(escrito['productoQueSeEscribe'])){document.getElementById("botonGuardarMerca").setAttribute("onclick", "actualizarStockMercaderia()");}
        else {document.getElementById("botonGuardarMerca").setAttribute("onclick", "");};
    });
}

// DE PYTHON A JAVASCRIPT, SE RECIBEN TODOS LOS PRODUCTOS QUE COINCIDAN CON LO ESCRITO
async function enviarTodosLosProductosMercaderia(){
    var url = URL + "/Mercaderia";
    var seRecibe = await fetch(url, {
        "method": 'GET',
        "headers": {
            "Content-Type": 'application/json'
        }
    });

    var ProductosMercaderia = await seRecibe.json();
    var Productos = [];

    for (var i = 0; i < ProductosMercaderia.length; i++){Productos.push(ProductosMercaderia[i]['productoCompleto']);};

    var datalist = "";
    for(var i = 0; i < Productos.length; i++){datalist += '<option value="' + Productos[i] + '">';};

    document.getElementById('productosMercaderia').innerHTML = datalist;

    return Productos;
}

// DE JAVASCRIPT A PYTHON, CUANDO SE DESEE AGREGAR MÁS STOCK DE UN PRODUCTO SE ENVÍAN LOS DATOS A AGREGAR
async function actualizarStockMercaderia(){
    var producto = document.getElementById("productoInput").value;
    var cantidad = document.getElementById("CantidadMercaderia").value;
    var costo = document.getElementById("CostoMercaderia").value;

    if(cantidad == "" || costo == ""){alert("Debe de rellenar todos los campos.")}
    else{
        var stock = {
            "productoMercaderia": producto,
            "cantidadMercaderia": cantidad,
            "costoMercaderia": costo
        }
        var url = URL + "/Mercaderia";
        await fetch(url, {
            "method": 'POST',
            "body": JSON.stringify(stock),
            "headers": {
                "Content-Type": 'application/json'
            }
        });

        alert("Stock Actualizado.");

        document.getElementById("productoInput").value = "";
        document.getElementById("CantidadMercaderia").value = "";
        document.getElementById("CostoMercaderia").value = "";

        recibirTodosLosProductosMercaderia();
    }
}

// DE JAVASCRIPT A PYTHON, CUANDO SE DESEE REGISTRAR UN NUEVO PRODUCTO EN LA TABLA Producto SE ENVÍAN TODOS LOS CAMPOS RELLENADOS
async function registrarNuevoProducto(){
    var ProductoRegistro = document.getElementById("ProductoRegistro");
    var StockRegistro = document.getElementById("StockRegistro");
    var PrecioUnitarioRegistro = document.getElementById("PrecioUnitarioRegistro");

    var operacionRegistro = "";
    var Gravada = document.getElementById("Gravada");
    var Inafecta = document.getElementById("Inafecta");
    if (Gravada.checked == true){operacionRegistro = "2";}
    else if (Inafecta.checked == true){operacionRegistro = "1";}
    else {alert("Seleccione el tipo de operacion");};

    if(ProductoRegistro.value == "" || StockRegistro.value == "" || PrecioUnitarioRegistro == ""){alert("Complete todos los campos.");};

    var registrarProducto = {
        "ProductoRegistro": ProductoRegistro.value,
        "StockRegistro": StockRegistro.value,
        "PrecioUnitarioRegistro": PrecioUnitarioRegistro.value,
        "operacionRegistro": operacionRegistro
    }

    var url = URL + "/Mercaderia";
    await fetch(url, {
        "method": 'POST',
        "body": JSON.stringify(registrarProducto),
        "headers": {
            "Content-Type": 'application/json'
        }
    });

    alert("Producto Registrado");
    document.getElementById("overlayMercaderia").style.display = "none";

    ProductoRegistro.value = "";
    StockRegistro.value = "";
    PrecioUnitarioRegistro.value = "";

    recibirTodosLosProductosMercaderia();
}

// FUNCIONES PARA RegistroDeProductos.html

// DE JAVASCRIPT A PYTHON, CUANDO SE DESEE PAGAR TODO LOS PRODUCTOS, SE ABRIRÁ UN POP-UP Y UNA VEZ SELECCIONADO TODOS LOS CAMPOS SE ENVIAN PARA ACTUALIZAR
// LA TABLA BoletaCabecera
async function Pagar(){
    if((!document.getElementById("Tarjeta").checked && !document.getElementById("Efectivo").checked && document.getElementById("Fiado") == null) ||
       (!document.getElementById("Tarjeta").checked && !document.getElementById("Efectivo").checked && document.getElementById("Fiado") != null && !document.getElementById("Fiado").checked) ||
       (!document.getElementById("Boleta").checked && !document.getElementById("Factura").checked)){
        alert("Debe de seleccionar todos los campos.")
    } else {
        var Cancelo = "";
        var MetodoPago = "";

        if(document.getElementById("Tarjeta").checked || document.getElementById("Efectivo").checked) {Cancelo = 0;}
        else {Cancelo = 1;};

        if(document.getElementById("Boleta").checked){MetodoPago = 1;}
        else {MetodoPago = 2;};

        var pago = {
            "Cancelo": Cancelo,
            "MetodoPago": MetodoPago
        };

        var url = URL + "/Compra";
        await fetch(url, {
            "method": 'POST',
            "body": JSON.stringify(pago),
            "headers": {
               "Content-Type": 'application/json'
            }
        });

        alert("Compra Finalizada");
        window.location.href= "http://127.0.0.1:3000/Cliente";
    }
}

// DE JAVASCRIPT A PYTHON, EN CASO SE DESEE ELIMINAR TODO LO QUE SE VA A COMPRAR, SE ENVIA EL COMANDO DE "ELIMINAR TODO"
async function eliminarTodo(){
    var url = URL + "/Compra";
    await fetch(url, {
        "method": 'POST',
        "body": JSON.stringify({"eliminarTodo": "Eliminar Todo"}),
        "headers": {
            "Content-Type": 'application/json'
        }
    });

    window.location.href= "http://127.0.0.1:3000/Cliente";
}

var JSONProductos = [];

// DE JAVASCRIPT A PYTHON, SE VERIFICA QUE LA CANTIDAD DESEADA SEA MENOR AL STOCK PARA PODER AGREGARLO EN DetalleBoleta TAMBIÉN ES AÑADIDO EN LA TALA VISUAL DE PRODUCTOS
async function recibirProductoConCantidad(){
    if(document.getElementById("cantidad").value != ""){
        var productoQueSeEscribe = document.getElementById("productoQueSeEscribe").value;
        var TablaProductos = document.getElementById("TablaProductos");
        var agregar = true;
        for(var i = 0; i < TablaProductos.rows.length; i++){if(productoQueSeEscribe == TablaProductos.rows[i].cells[1].innerText){agregar = false;};};

        if(document.getElementById("precioUnitario").value == ""){agregar = false;};

        if(agregar){
            var productoStock = document.getElementById("StockProducto").innerText;
            var cantidad = document.getElementById("cantidad").value;

            if(parseFloat(cantidad) > parseFloat(productoStock)){alert("No hay suficiente stock.");}
            else {
                var enviar =  {
                    "productoNombre": document.getElementById("productoQueSeEscribe").value,
                    "productoCantidad": cantidad
                };

                var url = URL + "/Compra";
                await fetch(url, {
                    "method": 'POST',
                    "body": JSON.stringify(enviar),
                    "headers": {
                        "Content-Type": 'application/json'
                    }
                });

                var agregarTablaNombre = document.getElementById("productoQueSeEscribe").value;
                var agregarTablaPrecioUnitario = parseFloat(document.getElementById("precioUnitario").value).toFixed(2);
                var agregarTablaCantidad = parseFloat(document.getElementById("cantidad").value).toFixed(2);
                var agregarTablaPrecioTotal = (agregarTablaPrecioUnitario * agregarTablaCantidad).toFixed(2);

                enviarTodosLosProductos().then(result => {
                    JSONProductos = result;

                    var SubTotalOPInafecta = JSONProductos[0].SubTotalOPInafecta;
                    var SubTotalOPGravada = JSONProductos[0].SubTotalOPGravada;
                    var IGV = JSONProductos[0].IGV;
                    var Total = JSONProductos[0].TotalPagar;
                    var ID_Producto = JSONProductos[0].ID_Producto;

                    document.getElementById("SubTotalOPInafecta").innerText = "Subtotal OP Inafecta: " + SubTotalOPInafecta;
                    document.getElementById("SubTotalOPGravada").innerText = "Subtotal OP Gravada: " + SubTotalOPGravada;
                    document.getElementById("IGV").innerText = "IGV: " + IGV;
                    document.getElementById("Total").innerText = "Total a Pagar: " + Total;
                    document.getElementById("TotalPagar").innerText = "Total a Pagar: " + Total;
                    document.getElementById("IDProducto").innerText = ID_Producto;

                    var agregarTablaIDProducto = document.getElementById("IDProducto").innerText;

                    //document.getElementById("TablaProductos").rows[0].cells[1].innerText
                    var TablaHTML = `
                        <tr data-row-id="${agregarTablaIDProducto}">
                            <td><a onclick="remove('${agregarTablaIDProducto}')" class="Boton">X</a></td>
                            <td>${agregarTablaNombre}</td>
                            <td>${agregarTablaPrecioUnitario}</td>
                            <td>${agregarTablaCantidad}</td>
                            <td>${agregarTablaPrecioTotal}</td>
                        </tr>
                    `

                    TablaProductos.innerHTML += TablaHTML;
                });
            }

            document.getElementById("productoQueSeEscribe").value = "";
            document.getElementById("cantidad").value = "";
            document.getElementById("precioUnitario").value = "";
            document.getElementById("StockProductoString").innerHTML = "";
        };
    };
}

// DE JAVASCRIPT A PYTHON, AL MOMENTO DE QUERER ELIMINAR UN PRODUCTO DE LA TABLA DetalleBoleta SE ENVIARÁ EL ID_Producto PARA PODER ELIMINARLO
// TAMBIÉN SE ACTUALIZA LA TABLA VISUAL DE LOS COSTOS
async function remove(TablaIDProducto){
    document.getElementById("TablaProductos").querySelector(`[data-row-id="${TablaIDProducto}"]`).remove();

    var eliminar = {"eliminar": TablaIDProducto};
    var url = URL + "/Compra";
    await fetch(url, {
        "method": 'POST',
        "body": JSON.stringify(eliminar),
        "headers": {
            "Content-Type": 'application/json'
        }
    });

    enviarTodosLosProductos().then(result => {
        JSONProductos = result;

        var SubTotalOPInafecta = JSONProductos[0].SubTotalOPInafecta;
        var SubTotalOPGravada = JSONProductos[0].SubTotalOPGravada;
        var IGV = JSONProductos[0].IGV;
        var Total = JSONProductos[0].TotalPagar;

        document.getElementById("SubTotalOPInafecta").innerText = "Subtotal OP Inafecta: " + SubTotalOPInafecta;
        document.getElementById("SubTotalOPGravada").innerText = "Subtotal OP Gravada: " + SubTotalOPGravada;
        document.getElementById("IGV").innerText = "IGV: " + IGV;
        document.getElementById("Total").innerText = "Total a Pagar: " + Total;
        document.getElementById("TotalPagar").innerText = "Total a Pagar: " + Total;
    });
}

// DE JAVASCRIPT A PYTHON, SE ENVIA EL NOMBRE DEL PRODUCTO ESCRITO A MEDIAS Y SE LLAMA A LA FUNCION agregarPrecioUnitario() PARA VALIDAR SI ES EL NOMBRE COMPLETO O NO
async function recibirProductoQueSeEscribe(){
    var escrito = {"productoQueSeEscribe": document.getElementById("productoQueSeEscribe").value};

    var url = URL + "/Compra";
    await fetch(url, {
    "method": 'POST',
    "body": JSON.stringify(escrito),
    "headers": {
        "Content-Type": 'application/json'
        }
    });

    enviarTodosLosProductos().then(result => {
        JSONProductos = result;
    });

    agregarPrecioUnitario();
}

// AL MOMENTO QUE SE ESCRIBE EL NOMBRE COMPLETO DEL PRODUCTO Y ESTE EXISTA, EL PRECIO UNITARIO DE DICHO PRODUCTO APARECERA AUTOMÁTICAMENTE ASÍ COMO SU STOCK ACTUAL
// TAMBIÉN SE HABILITA LA OPCIÓN PARA QUE PUEDA AGREGAR EL PRODUCTO A DetalleBoleta
function agregarPrecioUnitario(){
    var productoEscrito = document.getElementById("productoQueSeEscribe").value;
    var ProductosDatalist = document.getElementById("productos");

    if(ProductosDatalist.options != undefined){
        var listaProductosDatalist = [];
        var pos = -1;
        for(var i = 0; i < ProductosDatalist.options.length; i++){
            listaProductosDatalist.push(ProductosDatalist.options[i].value);

            if(listaProductosDatalist[i] == productoEscrito){pos = i;};
        };

        if(listaProductosDatalist.includes(productoEscrito)){
            document.getElementById("precioUnitario").value = JSONProductos[pos].precioUnitario;
            document.getElementById("botonAgregar").setAttribute("onclick", "recibirProductoConCantidad()");
            document.getElementById("StockProducto").innerText = JSONProductos[pos].StockProducto;
            document.getElementById("StockProductoString").innerHTML = "Stock Actual: " + JSONProductos[pos].StockProducto;

        } else {document.getElementById("botonAgregar").setAttribute("onclick", "")};
    };
}

// DE PYTHON A JAVASCRIPT, SE RECIBEN TODOS LOS NOMBRES DE LOS PRODUCTOS CON SIMILITUD A LO ESCRITO PARA RELLENAR EL DATALIST DE PRODUCTO
async function enviarTodosLosProductos(){
    var url = URL + "/Compra"
    var seRecibe = await fetch(url, {
        "method": 'GET',
        "headers": {
            "Content-Type": 'application/json'
        }
    });

    var FJSONProductos = await seRecibe.json();
    var productos = [];
    var preciosUnitarios = [];
    var idProductos = [];

    for (var i = 0; i < FJSONProductos.length; i++){
        productos.push(FJSONProductos[i]['productoCompleto'])
        preciosUnitarios.push(FJSONProductos[i]['precioUnitario'])
        idProductos.push(FJSONProductos[i]['ID_Producto'])
    };

    var datalist = "";

    for(var i = 0; i < productos.length; i++){datalist += '<option value="' + productos[i] + '">';};

    document.getElementById('productos').innerHTML = datalist;
    return FJSONProductos;
}

// DE PYTHON A JAVASCRIPT, SE RECIBE EL ID_FrecuenciaPago PARA VER SI SE HABILITA LA OPCIÓN DE PAGAR O NO POR MEDIO DE FIADO AL FINALIZAR LA COMPRA
async function ponerNombreClienteEnProductos(){
    var url = URL + "/Compra";
    var seRecibe = await fetch(url, {
        "method": 'GET',
        "headers": {
            "Content-Type": 'application/json'
        }
    });

    var seRecibio = await seRecibe.json();

    var ID_FP = seRecibio['ID_FP'];
    var overlay = document.getElementById("overlay-sub-grid-containerCambiar");

    if(ID_FP == 1){overlay.innerHTML = ``}
    else {
        overlay.innerHTML = `
            <div>
                <input type="radio" id="Fiado" name="MedioDePago" value="Fiado">
                <label for="Fiado">Fiado</label>
            </div>
        `
    };
}

// OPCIÓN DINÁMICA QUE SE ACTIVA CUANDO EL RADIO BUTTON DE FIAR - SÍ ES ACTIVADO. PARA MOSTRAR LA FRECUENCIA EN LA QUE PAGARÍA EL USUARIO AL MOMENTO DE REGISTRARLO
function AgregarSelect(){
    var overlay = document.getElementById("overlay-sub-grid-container2Cambiar");
    var si = document.getElementById("FiarSi");
    var no = document.getElementById("FiarNo");

    if (si.checked == true){
         overlay.innerHTML = `
            <div class="Texto">Fiar</div>
            <div>
                <input type="radio" id="FiarSi" name="Fiar" value="Si" checked onclick="AgregarSelect()">
                <label for="FiarSi" class="Radio">Sí</label>
            </div>
            <div>
                <input type="radio" id="FiarNo" name="Fiar" value="No" onclick="AgregarSelect()">
                <label for="FiarNo" class="Radio">No</label>
            </div>

            <label for="Frecuencia" class="Texto">Frecuencia</label>
            <select id="Frecuencia" name="Frecuencia">
                <option value="En 7 dias">Cada Domingo</option>
                <option value="En 15 dias">Cada Quincena</option>
                <option value="En 30 dias">Cada Fin de Mes</option>
            </select>
        `
    } else {
         overlay.innerHTML = `
            <div class="Texto">Fiar</div>
            <div>
                <input type="radio" id="FiarSi" name="Fiar" value="Si" onclick="AgregarSelect()">
                <label for="FiarSi" class="Radio">Sí</label>
            </div>
            <div>
                <input type="radio" id="FiarNo" name="Fiar" value="No" checked onclick="AgregarSelect()">
                <label for="FiarNo" class="Radio">No</label>
            </div>
        `
    };
}

// DE JAVASCRIPT A PYTHON, SI SE DESEA REGISTRAR UN NUEVO CLIENTE, SE ENVÍAN TODOS SUS DATOS
async function registrarCliente(){
    var FrecuenciaPago = "";
    if(document.getElementById("FiarNo").checked) {FrecuenciaPago = "1";}
    else{
        switch(document.getElementById("Frecuencia").value){
            case "Cada Domingo": FrecuenciaPago = "2"; break;
            case "Cada Quincena": FrecuenciaPago = "3"; break;
            case "Cada Fin de Mes": FrecuenciaPago = "4"; break;
        }
    };

    var registro = {
        "DNICliente": document.getElementById("DNICliente").value,
        "NombreCliente": document.getElementById("NombreCliente").value,
        "PrimerApellidoCliente": document.getElementById("PrimerApellidoCliente").value,
        "SegundoApellidoCliente": document.getElementById("SegundoApellidoCliente").value,
        "TelefonoCliente": document.getElementById("TelefonoCliente").value,
        "DireccionCliente": document.getElementById("DireccionCliente").value,
        "FrecuenciaPago": FrecuenciaPago
    };

    var url = URL + "/Cliente";
    await fetch(url, {
        "method": 'POST',
        "body": JSON.stringify(registro),
        "headers": {
           "Content-Type": 'application/json'
        }
    });

    alert("Cliente Registrado");
    window.location.reload();
}

// ACTIVADO POR EL BOTÓN DE REGRESAR PARA IR AL MENÚ PRINCIPAL
function regresarAIniciarSesion(){window.location.href= "http://127.0.0.1:3000/";}

// CUANDO NO EXISTA DEUDA ALGUNA, SE HABILITA LA OPCIÓN DE PODER REGISTRAR PRODUTOS
function pasarACompra(){
    var TablaPagos = document.getElementById("comprasRealizadas");
    var continuar = true;

    if(TablaPagos.rows.length > 1){for(var i = 0; i < TablaPagos.rows.length; i++){if(TablaPagos.rows[i].cells[3].innerText == "Sí"){continuar = false;};};};

    if(continuar){window.location.href= "http://127.0.0.1:3000/Compra";}
    else {alert("Se deben de pagar las deudas.");}
}


// DE JAVASCRIPT A PYTHON, CUANDO SE PRESIONE EL BOTÓN DE PAGAR UNA DE LAS DEUDAS, SE ENVIARÁ LA ID_BoletaCabecera CORRESPONDIENTE Y SE ACTUALIZARÁ LA TABLA LLAMANDO
// A LA FUNCIÓN recibirPagos() NUEVAMENTE
async function pagar(ID_BoletaCabecera){
    var pagar = {"ID_BoletaCabeceraPagar": ID_BoletaCabecera};

    var url = URL + '/Cliente';
    await fetch(url, {
        "method": 'POST',
        "body": JSON.stringify(pagar),
        "headers": {
            "Content-Type": 'application/json'
        }
    });

    alert("Pago Realizado");
    recibirPagos();
}

// DE PYTHON A JAVASCRIPT, UNA VEZ PRESIONADO EL BOTÓN DE HISTORIAL, SE RECIBIRÁ TODAS LAS COMPRAS REALIZADAS POR EL USUARIO Y EN CASO PRESENTE DEUDA EN ALGUNA,
// SE AÑADIRÁ UN BOTON PARA QUE PUEDA PAGAR DICHA DEUDA
async function recibirPagos(){
    var url = URL + "/Cliente";
    var seRecibe = await fetch(url, {
        "method": 'GET',
        "headers": {
            "Content-Type": 'application/json'
        }
    });

    var pagos = await seRecibe.json();
    var TablaPagos = document.getElementById("comprasRealizadas");

    if(pagos.length > 0){
        var FrecuenciaPago = pagos[0]['ID_FP'];
        document.getElementById("Reporte").innerHTML = "Reporte - Frecuencia de Pago: " + FrecuenciaPago;

        var aumentarMedida = 0;
        if(pagos.length < 5){aumentarMedida = pagos.length * 20;}
        else {aumentarMedida = 160;};

        var height1 = `${250 + aumentarMedida}px`
        var height2 = `${100 + aumentarMedida}px`
        document.getElementById("ClienteGridContainer").style.height = height1; //original 250px `${250 + aumentarMedida}px`
        document.getElementById("ClienteSubGridContainer2").style.height = height2; //original 80px, por cada fila sumarle 20px

        var TablaHTML = `
        <tr>
            <th>Pagar</th>
            <th>Fecha Realizada</th>
            <th>Total</th>
            <th>Deuda</th>
        </tr>
        `

        TablaPagos.innerHTML = TablaHTML;

        for(var i = 0; i < pagos.length; i++){
            var ID_BoletaCabecera = pagos[i]['ID_BoletaCabecera'];
            var Pagar = pagos[i]['Deuda'];
            var Total = pagos[i]['Total'];

            var FechaSinFormato = new Date(pagos[i]['Fecha']);
            var Fecha = FechaSinFormato.getDate() + '/' + (FechaSinFormato.getMonth() + 1) + '/' + FechaSinFormato.getFullYear();

            if (Pagar == 1){
                TablaHTML = `
                <tr data-row-id="${ID_BoletaCabecera}">
                    <td><a onclick="pagar('${ID_BoletaCabecera}')" class="Boton">Pagar</a></td>
                    <td>${Fecha}</td>
                    <td>${Total}</td>
                    <td>Sí</td>
                </tr>
                `
            } else {
                TablaHTML = `
                <tr data-row-id="${ID_BoletaCabecera}">
                    <td>-</td>
                    <td>${Fecha}</td>
                    <td>${Total}</td>
                    <td>No</td>
                </tr>
                `
            }

            TablaPagos.innerHTML += TablaHTML;
        };
    } else {
        document.getElementById("ClienteGridContainer").style.height = "250px"; //original 250px `${250 + aumentarMedida}px`
        document.getElementById("ClienteSubGridContainer2").style.height = "80px"; //original 80px, por cada fila sumarle 20px
        document.getElementById("Reporte").innerHTML = "Reporte - Frecuencia de Pago: Al Contado";

        TablaPagos.innerHTML = `
        <tr>
            <th>No hay historial registrado</th>
        </tr>
        `
    };
}

// DE JAVASCRIPT A PYTHON, SE ENVIA EL NOMBRE COMPLETO PARA RECIBIR SUS ATRIBUTOS CORRESPONDIENTES
async function enviarNombreClienteCompleto(){
    var nombreCompletoEscrito = document.getElementById("nombreQueSeEscribe").value;
    var nombreCompletoJSON = {"nombreCompleto": nombreCompletoEscrito};

    var url = URL + "/Cliente";
    await fetch(url, {
        "method": 'POST',
        "body": JSON.stringify(nombreCompletoJSON),
        "headers": {
            "Content-Type": 'application/json'
        }
    });

    recibirPagos();
    document.getElementById("botonContinuar").setAttribute("onclick", "pasarACompra()");
}


// DE JAVASCRIPT A PYTHON, SE ENVIA EL NOMBRE A MEDIAS DEL CLIENTE QUE SE ESCRIBE
async function recibirClienteQueSeEscribe(){
    var escrito = {"nombreQueSeEscribe": document.getElementById("nombreQueSeEscribe").value};

    var url = URL + "/Cliente"
    await fetch(url, {
        "method": 'POST',
        "body": JSON.stringify(escrito),
        "headers": {
            "Content-Type": 'application/json'
        }
    });

    enviarTodosLosClientes();
}


var clientes = [];

// DE PYTHON A JAVASCRIPT, SE RECIBEN TODOS LOS NOMBRES QUE TENGAN SIMILITUD CON LO ESCRITO EN LA PARTE DE BUSCAR CLIENTE.
async function enviarTodosLosClientes(){
    var url = URL + "/Cliente";
    var seRecibe = await fetch(url, {
        "method": 'GET',
        "headers": {
            "Content-Type": 'application/json'
        }
    });

    var clientes = await seRecibe.json();

    var NombresDatalist = document.getElementById("clientes");
    var datalist = "";

    for(var i = 0; i < clientes.length; i++){datalist += '<option value="' + clientes[i]['nombreCompleto'] + '">';};

    NombresDatalist.innerHTML = datalist;

    // EN CASO EL NOMBRE COMPLETO EXISTA, SE HABILITARÁ LA OPCIÓN DE PODER VER SU HISTORIAL DE COMPRA
    var nombreCompletoEscrito = document.getElementById("nombreQueSeEscribe").value;
    if(NombresDatalist.options != undefined){
        var listaNombresDatalist = []
        for(var i = 0; i < NombresDatalist.options.length; i++){listaNombresDatalist.push(NombresDatalist.options[i].value);}

        if(listaNombresDatalist.includes(nombreCompletoEscrito)){document.getElementById("botonHistorial").setAttribute("onclick", "enviarNombreClienteCompleto()");}
        else {
            document.getElementById("botonHistorial").setAttribute("onclick", "");
            document.getElementById("botonContinuar").setAttribute("onclick", "");
        };
    };
}

// FUNCIONES PARA IniciarSesion.html

// AL MOMENTO DE CARGAR SELECCIONAR CLIENTE, SE VERIFICARÁ SI EL ID_Cajero ES IGUAL A UNO, SIENDO ASÍ SERÍA EL ADMINSTRADOR DE LA TIENDA EL CUAL TIENE PERMITIDO
// IR A LA PESTAÑA DE MERCADERÍA
function pasarAMercaderia(){
    if(document.getElementById("ID_Cajero").innerText == "1"){window.location.href= "http://127.0.0.1:3000/Mercaderia";}
    else {alert("Solo el administrador de la tienda puede hacerlo.");};
}

// DE PYTHON A JAVASCRIPT, SE RECIBE EL ID_Cajero EN CASO SEA CERO, SE MANDA UNA ALERTA DE QUE NO EXISTE, SI NO SE REDIRIGE A SELECCIONAR CLIENTE
async function pasarACliente(){
    var url = URL;
    var confirmacion = await fetch(url, {
        "method": 'GET',
        "headers": {
            "Content-Type": 'application/json'
        }
    });

    var seConfirmo = await confirmacion.json();
    seConfirmo = seConfirmo['idCajeroRecibido'];

    idCajero = seConfirmo;

    if(seConfirmo == 0){
        alert("No existe el Cajero");
        window.location.reload();
    } else {window.location.href= "http://127.0.0.1:3000/Cliente";};

}

// DE JAVASCRIPT A PYTHON, SE ENVIAN LOS DATOS QUE SE INGRESARON COMO USUARIO Y CONTRASEÑA PARA VERIFICAR SI EXISTE
async function iniciarSesionCajero(){
    var comprobar = {
        "Usuario": document.getElementById("usuarioIngresar").value,
        "Contrasena": document.getElementById("contrasenaIngresar").value
    }

    var url = URL
    await fetch(url, {
        "method": 'POST',
        "body": JSON.stringify(comprobar),
        "headers": {
            "Content-Type": 'application/json'
        }
    });

    pasarACliente();
}

// DE JAVASCRIPT A PYTHON, SE ENVIAN LOS DATOS PARA REGISTRAR UN NUEVO CAJERO
async function registrarCajero(){
    var registro = {
        "NombreCajero": document.getElementById("NombreCajero").value,
        "ApellidoCajero": document.getElementById("ApellidoCajero").value,
        "DNICajero": document.getElementById("DNICajero").value,
        "UsuarioRegistrarCajero": document.getElementById("UsuarioRegistrarCajero").value,
        "ContrasenaRegistrarCajero": document.getElementById("ContrasenaRegistrarCajero").value
    };

    var url = URL;
    await fetch(url, {
        "method": 'POST',
        "body": JSON.stringify(registro),
        "headers": {
           "Content-Type": 'application/json'
        }
    });

    alert("Cajero Registrado");
    window.location.reload();
}
