using Cajero.Logica.Entidades;

namespace Cajero.Logica.Interfaces
{
    public interface IRepositorioSesiones
    {
        void Guardar(Sesion sesion);
        List<Operacion> ObtenerOperaciones(int idSesion);
    }
}
