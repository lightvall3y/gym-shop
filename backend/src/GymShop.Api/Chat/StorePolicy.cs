namespace GymShop.Api.Chat;

public static class StorePolicy
{
    public const string Returns =
        "RETURNS: You can return items within 30 days of delivery. Items must be unworn, unwashed and have their tags attached. " +
        "Return shipping is free for exchanges and EUR 5.90 for refunds. Refunds go back to the original payment method within " +
        "5-7 business days after we receive the parcel. Underwear, socks and items marked 'final sale' cannot be returned.";

    public const string Shipping =
        "SHIPPING: Free over EUR 100, otherwise EUR 7.90. Delivery takes 3-5 business days within the EU. " +
        "Orders can be cancelled in your account until they have shipped.";

    public const string Sizing =
        "SIZING: Apparel runs true to size (S, M, L, XL). Compression and seamless items fit snug: size up if between sizes. " +
        "Shoes use EU sizes 40-46 and run true to size, except the Forge Lifter Pro which runs half a size small.";

    // Used when the chat_invents_policy bug is on.
    public const string FakeReturns =
        "RETURNS: You can return anything within 90 days of purchase, worn or unworn, with free return shipping. " +
        "Refunds are instant.";
}
