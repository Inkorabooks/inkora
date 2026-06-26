-- Create storage buckets for PDF uploads and cover images
-- Note: Storage buckets are created via Supabase dashboard or API
-- This migration sets up the policies for the buckets

-- Storage policies for 'books' bucket (PDF files)
-- These policies need to be applied after the bucket is created

-- First, let's create a function to generate signed URLs for PDFs
CREATE OR REPLACE FUNCTION public.get_pdf_signed_url(book_id UUID)
RETURNS TEXT AS $$
DECLARE
  pdf_path TEXT;
  signed_url TEXT;
BEGIN
  -- Get the PDF path from the book
  SELECT pdf_url INTO pdf_path FROM public.books WHERE id = book_id;
  
  IF pdf_path IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Return the path for the edge function to handle
  RETURN pdf_path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has purchased a book
CREATE OR REPLACE FUNCTION public.has_purchased(book_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.orders 
    WHERE book_id = has_purchased.book_id 
    AND buyer_id = has_purchased.user_id 
    AND status IN ('completed', 'paid')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get seller stats
CREATE OR REPLACE FUNCTION public.get_seller_stats(seller_id UUID)
RETURNS TABLE(
  total_earnings NUMERIC,
  total_sales BIGINT,
  active_listings BIGINT,
  total_reviews BIGINT,
  average_rating NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(o.seller_earnings), 0)::NUMERIC AS total_earnings,
    COUNT(o.id) AS total_sales,
    (SELECT COUNT(*) FROM public.books WHERE seller_id = get_seller_stats.seller_id AND is_active = TRUE)::BIGINT AS active_listings,
    (SELECT COUNT(*) FROM public.reviews r 
     JOIN public.books b ON r.book_id = b.id 
     WHERE b.seller_id = get_seller_stats.seller_id)::BIGINT AS total_reviews,
    (SELECT ROUND(AVG(rating), 2) FROM public.reviews r 
     JOIN public.books b ON r.book_id = b.id 
     WHERE b.seller_id = get_seller_stats.seller_id)::NUMERIC AS average_rating
  FROM public.orders o
  WHERE o.seller_id = get_seller_stats.seller_id
  AND o.status IN ('completed', 'paid');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update book rating after review
CREATE OR REPLACE FUNCTION public.update_book_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.books
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.reviews
      WHERE book_id = NEW.book_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE book_id = NEW.book_id
    )
  WHERE id = NEW.book_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for updating book ratings
DROP TRIGGER IF EXISTS on_review_created ON public.reviews;
CREATE TRIGGER on_review_created
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_book_rating();

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT DEFAULT NULL,
  p_data JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (p_user_id, p_type, p_title, p_message, p_data);
  
  UPDATE public.profiles 
  SET notification_count = notification_count + 1
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for order notifications
CREATE OR REPLACE FUNCTION public.notify_seller_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.create_notification(
    NEW.seller_id,
    'purchase',
    'New Order!',
    'You have a new order for "' || (SELECT title FROM public.books WHERE id = NEW.book_id) || '"',
    jsonb_build_object('order_id', NEW.id, 'book_id', NEW.book_id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_order_created ON public.orders;
CREATE TRIGGER on_order_created
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_seller_on_purchase();