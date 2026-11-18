using Cajero.Logica.Entidades;
using Cajero.Logica.Enums;

namespace Cajero.Logica.Resultados
{
    public class ResultadoSesion
    {
        public EstadoValidacionTarjeta Estado { get; set; }
        public Sesion? Sesion { get; set; }
    }
}
