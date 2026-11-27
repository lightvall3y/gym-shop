namespace GymShop.Api.Domain;

/// <summary>A runtime override for one deliberate bug. Stored in the database so every API instance agrees.</summary>
public class FeatureFlag
{
    public string Key { get; set; } = "";
    public bool Enabled { get; set; }
}
