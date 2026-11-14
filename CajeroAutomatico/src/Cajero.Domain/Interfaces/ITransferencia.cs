using System;
using System.Collections.Generic;
using System.Text;

namespace Cajero.Domain.Interfaces
{
    public interface ITransferencia : IOperacion
    {
        decimal Monto { get; set; }
        string CbuDestino { get; set; }
        string NumeroComprobante { get; set; }
    }
}
