using Cajero.Domain.Entidades;

namespace Cajero.Domain.Resultados
{
    public class ResultadoExtraccion
    {
        public Extraccion? Operacion { get; set; }
        public string Mensaje { get; set; } = string.Empty;
    }
}
