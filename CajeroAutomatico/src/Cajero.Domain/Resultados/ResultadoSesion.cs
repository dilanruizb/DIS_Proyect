using Cajero.Domain.Entidades;
using Cajero.Domain.Enums;

namespace Cajero.Domain.Resultados
{
    public class ResultadoSesion
    {
        public EstadoValidacionTarjeta Estado { get; set; }
        public Sesion? Sesion { get; set; }
    }
}
