### Documentación y explicación de las decisiones tomadas en el desarrollo del proyecto:

## Diseño
Se ha elegido nestjs como framework para hacer la REST API, es un framework que puede utilizar por debajo express o fastify, en este caso ha sido configurado con express.

El código ha sido encapsulado en módulos de acuerdo a su funcionalidad. Los servicios abstraen a los controladores de las sentencias ejecutadas en la base de datos y el manejo de estos, los controladores son los encargados de controlar el flujo de la petición, comprobar y asegurar que la petición es realizada de acuerdo a lo esperado.

Los pipes se encargan de transformar los objetos planos de javascript recibidos en las peticiones en instancias de clases DTO.

La librería class-transformer se encarga de eliminar cualquier propiedad de los objetos no indicada en estos DTO y de asegurarse de que el JSON enviado cumple con las especificaciones de estos (Campos requeridos, tipos de estos, etc.)

El patrón DTO permite abstraer a los clientes de la representación interna de los datos en la bbdd y su representación en código como entidades.

De acuerdo a los principios SOLID, cada clase tiene una única responsabilidad, están abiertas a la extensión, pero no a la modificación, permiten ser sustituidas por mocks, las interfaces son segregadas para combinarlas después y el control es invertido (como en los servicios hacia el controlador).

Se han implementado algunos test end to end que emulan las peticiones de un cliente.
Las funcionalidades se han probado de manera manual (con Curl y ThunderClient) dada la envergadura del proyecto y la participación de una única persona sin refactorizaciones esperadas.
La configuración de Postman está guardada en la carpeta data en formato json.

Se ha utilizado SQLite como base de datos aunque no sea necesaria y TypeORM como orm para la futura migración al uso de una base de datos candidata para producción como lo pueda ser postgres o mysql. Gracias a esta decisión la migración se puede realizar de manera simple.

Se ha preferido el lenguaje typescript con la configuración más estricta posible frente a javascript puro ya que este elimina gran cantidad de bugs que ocurren por los tipos, en tiempo de compilación.

Se han reducido todos los codesmells posibles, extrayendo el código duplicado en módulos o funciones para su uso en varios sitios.

El rendimiento es acorde a lo esperado, se ha intentado hacer uso del código asíncrono y la agrupación de promesas para el aumento del rendimiento

La implementación no sigue al pie de la letra la documentación de swagger ofrecida ya que en ciertas ocasiones no es la manera más conveniente.

Se ha implementado el registro de usuarios guardando la contraseña encriptada por la librería @node-rs/bcrypt, una implementación de bcrypt escrita en rust con mayor rendimiento.

La autenticación se realiza usando JWT, los tokens tienen que ser mandados en cada endpoint, a futuro se debería refactorizar creando un guardián de AuthN [ejemplo](https://github.com/iacs-biocomp/competencias/blob/develop/backend/src/guards/auth/auth.guard.ts) y controlar la autorización en los controladores si es compleja o en otro guardián si es más simple.
