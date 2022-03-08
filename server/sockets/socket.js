const { io } = require('../server');
const {crearMensaje} = require('../utils/utils.js');


const { Usuarios } = require('../classes/usuarios');

const usuarios = new Usuarios();

io.on('connection', (client) => {

    client.on('entrarChat', (data, callback) => {
        console.log(data);

        if(!data.nombre || !data.sala){
            return callback({
                error: true,
                mensaje: "El nombre y la sala es necesario"
            });
        }

        client.join(data.sala);

        usuarios.agregarPersona(client.id, data.nombre , data.sala);
        client.broadcast.to(data.sala).emit('listadoPersona', usuarios.getPersonasBySala(data.sala));
        callback(usuarios.getPersonasBySala(data.sala));

    });


    client.on('disconnect', () => {
        let personaBorrada = usuarios.borrarPersona(client.id);

        client.broadcast.to(personaBorrada.sala).emit('crearMensaje',crearMensaje('Admin', `${personaBorrada.nombre} salió`));
        client.broadcast.to(personaBorrada.sala).emit('listadoPersona', usuarios.getPersonasBySala(personaBorrada.sala));
    });

    client.on('crearMensaje', (data) => {

        let persona = usuarios.getPersona(client.id);

        let mensaje = crearMensaje(persona.nombre, data.mensaje)
        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);
    });


    client.on('mensajePrivado', (data) => {
        let persona = usuarios.getPersona(client.id);

        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje));

    });
});