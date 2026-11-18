using Cajero.Logica.Resultados;

namespace Cajero.Logica.Interfaces
{
    public interface ISucursalDB
    {
        ResultadoTarjeta validarTarjeta(string numero);
    }
}
