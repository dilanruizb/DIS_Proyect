using Cajero.Logica.Entidades;

namespace Cajero.Logica.Interfaces
{
    public interface IInteraccionCajero
    {
        string? LeerOpcion();
        string? LeerPIN();
        void SolicitarCierre(Sesion sesion);
        void MostrarMensaje(string mensaje);
    }
}
