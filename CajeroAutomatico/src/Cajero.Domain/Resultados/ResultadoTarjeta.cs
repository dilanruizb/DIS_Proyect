using Cajero.Domain.Entidades;
using Cajero.Domain.Enums;

namespace Cajero.Domain.Resultados
{
    public class ResultadoTarjeta
    {
        public EstadoValidacionTarjeta Estado { get; set; }
        public Tarjeta? Tarjeta { get; set; }
    }
}
