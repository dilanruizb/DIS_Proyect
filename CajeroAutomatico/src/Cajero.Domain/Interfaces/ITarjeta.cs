using System;
using System.Collections.Generic;
using System.Text;

namespace Cajero.Domain.Interfaces
{
    public interface ITarjeta
    {
        string Numero { get; set; }
        DateOnly FechaVencimiento { get; set; }
        bool Bloqueada { get; set; }
        string EntidadEmisora { get; set; }

        int IdCliente { get; set; }
        string NumeroCuenta { get; set; }
    }
}
