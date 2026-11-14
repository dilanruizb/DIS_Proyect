using Cajero.Domain.Entidades;

namespace Cajero.Domain.Interfaces
{
    public interface IInteraccionCajero
    {
        string? LeerOpcion();
        string? LeerPIN();
        void SolicitarCierre(Sesion sesion);
        void MostrarMensaje(string mensaje);
    }
}
