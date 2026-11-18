using Cajero.Logica.Entidades;

namespace Cajero.Logica.Resultados
{
    public class ResultadoExtraccion
    {
        public Extraccion? Operacion { get; set; }
        public string Mensaje { get; set; } = string.Empty;
    }
}
