using Cajero.Domain.Entidades;
using Cajero.Domain.Resultados;

namespace Cajero.Domain.Interfaces
{
    public interface ICentralDB
    {
        bool validarPIN(string numeroTarjeta, string pin);
        Cuenta? consultarCuentaPorTarjeta(string numeroTarjeta);
        ResultadoExtraccion debitar(Sesion sesion, decimal monto);
        string transferir(Sesion sesion, string cbuDestino, decimal monto);
    }
}
