using Cajero.Logica.Entidades;
using Cajero.Logica.Resultados;

namespace Cajero.Logica.Interfaces
{
    public interface ICentralDB
    {
        bool validarPIN(string numeroTarjeta, string pin);
        Cuenta? consultarCuentaPorTarjeta(string numeroTarjeta);
        ResultadoExtraccion debitar(Sesion sesion, decimal monto);
        string transferir(Sesion sesion, string cbuDestino, decimal monto);
    }
}
