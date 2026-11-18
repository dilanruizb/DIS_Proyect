using Cajero.Logica.Entidades;
using Cajero.Logica.Enums;

namespace Cajero.Logica.Resultados
{
    public class ResultadoTarjeta
    {
        public EstadoValidacionTarjeta Estado { get; set; }
        public Tarjeta? Tarjeta { get; set; }
    }
}
