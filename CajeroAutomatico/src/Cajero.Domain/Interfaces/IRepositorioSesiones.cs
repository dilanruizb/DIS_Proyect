using Cajero.Domain.Entidades;

namespace Cajero.Domain.Interfaces
{
    public interface IRepositorioSesiones
    {
        void Guardar(Sesion sesion);
        List<Operacion> ObtenerOperaciones(int idSesion);
    }
}
