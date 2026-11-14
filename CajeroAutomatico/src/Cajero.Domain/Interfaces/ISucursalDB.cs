using Cajero.Domain.Resultados;

namespace Cajero.Domain.Interfaces
{
    public interface ISucursalDB
    {
        ResultadoTarjeta validarTarjeta(string numero);
    }
}
